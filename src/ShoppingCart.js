import ItemBinder from "../src/ItemBinder.js";

class ShoppingCart extends HTMLElement {
    #cartData = [];
    #renderedCartItems = [];

    constructor() {
        super();

        this.#render();
    }

    #toggleVisible = (event) => {
        let cartElement = this.querySelector("#shoppingCartBackground");
        if (cartElement.style.display === "") {
            cartElement.style.display = "block";
            this.#displayCartItems();
        } else {
            cartElement.style.display = "";
        }
        window.scrollTo(0, 0);
    }

    async #render() {
        let pageHtml = await fetch("../pages/ShoppingCart.html");
        this.innerHTML = await pageHtml.text();    
        if (document.cookie.includes("shoppingCart=")) {
            this.#cartData = this.#getCartFromCookie();
        } else {
            document.cookie = "shoppingCart=;";
        }

        let openButton = this.querySelector("#showCartLink");
        let cartElement = this.querySelector("#shoppingCartBackground");
        let closeButton = cartElement.querySelector(".closeButton");
        openButton.addEventListener("click", this.#toggleVisible);
        closeButton.addEventListener("click", this.#toggleVisible);
    }

    async #displayCartItems() {
        this.#renderedCartItems = [];
        let renderNode = this.querySelector("#cartItemsRender");
        renderNode.innerHTML = "";

        for (let itemIndex in this.#cartData) {
            await this.#renderCartItem(itemIndex);
        }
    }

    updateTotal() {
        let totalPrice = 0;
        for (let renderedItem of this.#renderedCartItems) {
            totalPrice += Number(renderedItem.key.item.fields.price.doubleValue.replace("$",""));
        }
        this.querySelector("#cartTotal").innerText = totalPrice.toLocaleString("en-us", {style: 'currency',currency: 'USD', minimumFractionDigits: 2});
    }

    async #renderCartItem(itemIndex) {
        let renderNode = this.querySelector("#cartItemsRender");
        let cartTemplate = this.querySelector("#cartProductTemplate").content.firstElementChild;

        let cartItem = this.#cartData[itemIndex];
        let url = `https://firestore.googleapis.com/v1/projects/i-love-lamp-40190/databases/(default)/documents/Products/${cartItem.productId}`;
        let data = await fetch(url);
        let item = await data.json();
        let variant = cartItem.variant;
        let price = item.fields.Variants.arrayValue.values[variant].mapValue.fields.Price;
        if (price.doubleValue) price = price.doubleValue;
        else if (price.integerValue) price = price.integerValue;
        let totalPrice = cartItem.purchaseQuantity * price;

        let newNode;
        let existingNode;
        for (let renderedItem in this.#renderedCartItems) {
            if (this.#renderedCartItems[renderedItem].key.cartItem == cartItem) {
                existingNode = this.#renderedCartItems[renderedItem];
                this.#renderedCartItems[renderedItem].key.item = item;
                break;
            }
        }

        if (existingNode) {
            newNode = existingNode.value;
            newNode.outerHtml = cartTemplate.outerHtml;
        } else {
            newNode = cartTemplate.cloneNode(true);
            this.#renderedCartItems.push({key: {item: item, cartItem: cartItem}, value: newNode});
            renderNode.appendChild(newNode);
            
            let quantityPlusButton = newNode.querySelector(".button.quantityPlus");
            quantityPlusButton.addEventListener("click", () => {
                cartItem.purchaseQuantity++;
                this.#cartToCookie();
                this.#renderCartItem(itemIndex);
            });
    
            let quantityMinusButton = newNode.querySelector(".button.quantityMinus");
            quantityMinusButton.addEventListener("click", () => {
                cartItem.purchaseQuantity--;

                if (cartItem.purchaseQuantity == 0) {
                    this.#cartData.splice(this.#cartData.indexOf(cartItem), 1);
                    this.#cartToCookie();
                    this.#displayCartItems();
                } else {
                    this.#cartToCookie();
                    this.#renderCartItem(itemIndex);
                }
            });
    
        }
        item.fields.purchaseQuantity = { doubleValue: cartItem.purchaseQuantity };
        item.fields.shortDescription = { stringValue: item.fields.Variants.arrayValue.values[variant].mapValue.fields.Name.stringValue };
        item.fields.variant = { doubleValue: variant };
        item.fields.image = { stringValue: item.fields.Variants.arrayValue.values[variant].mapValue.fields.Images.arrayValue.values[0].stringValue };
        item.fields.price = { doubleValue: totalPrice.toLocaleString("en-us", {style: 'currency',currency: 'USD', minimumFractionDigits: 2}) };
        this.updateTotal();

        let binder = new ItemBinder(item.fields, newNode);
    }

    #getCartFromCookie() {
        let cartData = document.cookie.match(/(?<=(shoppingCart=)).*?(?=;|$)/)[0];
        if (cartData == "") return [];

        cartData = atob(cartData);
        return JSON.parse(cartData);
    }

    #cartToCookie() {
        document.cookie = "shoppingCart=" + btoa(JSON.stringify(this.#cartData));
    }

    addToCart(cartItem) {
        let existingItem = this.#cartData.find(x => x.productId == cartItem.productId && x.variant == cartItem.variant);
        if (existingItem) {
            existingItem.purchaseQuantity++;
        } else {
            this.#cartData.push(cartItem);
        }
        this.#cartToCookie();
        let cartElement = this.querySelector("#shoppingCartBackground");
        if (cartElement.style.display === "") this.#toggleVisible();
    }
}

export default ShoppingCart;