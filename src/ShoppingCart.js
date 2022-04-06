import FetchHtmlElement from "./FetchHtmlElement.js";
import ItemBinder from "./ItemBinder.js";

class ShoppingCart extends FetchHtmlElement {
    #cartData = [];
    #renderedCartItems = [];

    constructor() {
        super();

        this.addHtmlLoadedHandler(() => { this.#render(); });
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
        if (cartElement.style.display === "") this.toggleVisible();
    }
    
    toggleVisible = () => {
        let cartElement = this.querySelector("#shoppingCartBackground");
        if (cartElement.hasAttribute("open")) {
            cartElement.removeAttribute("open");
        } else {
            cartElement.setAttribute("open", "");
            document.querySelector(".navbarHamburger").focus();
            cartElement.focus();
            this.#displayCartItems();
        }
        window.scrollTo(0, 0);
    }

    async #render() {
        if (document.cookie.includes("shoppingCart=")) {
            this.#cartData = this.#getCartFromCookie();
        } else {
            document.cookie = "shoppingCart=;";
        }

        let openButton = this.querySelector("#showCartLink");
        let cartElement = this.querySelector("#shoppingCartBackground");
        let closeButton = cartElement.querySelector(".shoppingCartCloseButton");
        openButton.addEventListener("click", this.toggleVisible);
        closeButton.addEventListener("click", this.toggleVisible);
    }

    async #displayCartItems() {
        this.#renderedCartItems = [];
        let renderNode = this.querySelector("#cartItemsRender");
        renderNode.innerHTML = "";

        for (let itemIndex in this.#cartData) {
            await this.#renderCartItem(itemIndex);
        }
    }

    #updateTotal() {
        let totalPrice = 0;
        for (let renderedItem of this.#renderedCartItems) {
            let price = renderedItem.key.item.fields.price.doubleValue.replace(/[^\d.]/g,"");
            totalPrice += Number(price);
        }
        this.querySelector("#cartTotal").innerText = totalPrice.toLocaleString("en-us", {style: 'currency',currency: 'USD', minimumFractionDigits: 2});
    }

    async #renderCartItem(itemIndex) {
        let renderNode = this.querySelector("#cartItemsRender");
        let cartTemplate = this.querySelector("#cartProductTemplate").content.firstElementChild;
        let cartItem = this.#cartData[itemIndex];

        let indexElement = document.querySelector("ilovelamp-index");
        let product = await indexElement.getProduct(cartItem.productId);
        let variant = cartItem.variant;
        let price = product.fields.Variants.arrayValue.values[variant].mapValue.fields.Price;
        if (price.doubleValue) price = price.doubleValue;
        else if (price.integerValue) price = price.integerValue;

        let getExistingNode = () => {
            for (let renderedItem in this.#renderedCartItems) {
                if (this.#renderedCartItems[renderedItem].key.cartItem == cartItem) {
                    this.#renderedCartItems[renderedItem].key.item = product;
                    return this.#renderedCartItems[renderedItem];
                }
            }
        }
        let existingNode = getExistingNode();

        let newNode;
        if (existingNode) {
            newNode = existingNode.value;
            newNode.outerHtml = cartTemplate.outerHtml;
        } else {
            newNode = this.#createCartItemNode(cartTemplate, product, cartItem, itemIndex);
            renderNode.appendChild(newNode);
        }
        newNode.querySelector(".cartItemThumbImage").addEventListener("click", () => { window.location.hash=`page=Product&product=${cartItem.productId}`; this.toggleVisible();});

        this.#setItemFields(product, cartItem, variant, cartItem.purchaseQuantity * price);
        this.#updateTotal();

        ItemBinder.bindItemToElement(product.fields, newNode, cartItem.productId)
    }

    #setItemFields(item, cartItem, variant, totalPrice) {
        item.fields.purchaseQuantity = { doubleValue: cartItem.purchaseQuantity };
        item.fields.shortDescription = { stringValue: item.fields.Variants.arrayValue.values[variant].mapValue.fields.Name.stringValue };
        item.fields.variant = { doubleValue: variant };
        item.fields.image = { stringValue: item.fields.Variants.arrayValue.values[variant].mapValue.fields.Images.arrayValue.values[0].stringValue };
        item.fields.price = { doubleValue: totalPrice.toLocaleString("en-us", { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }) };
    }

    #createCartItemNode(cartTemplate, item, cartItem, itemIndex) {
        let newNode = cartTemplate.cloneNode(true);
        this.#renderedCartItems.push({ key: { item: item, cartItem: cartItem }, value: newNode });

        let quantityPlusButton = newNode.querySelector(".button.quantityPlus");
        quantityPlusButton.addEventListener("click", () => {
            this.#itemQuantityUp(cartItem, itemIndex);
        });

        let quantityMinusButton = newNode.querySelector(".button.quantityMinus");
        quantityMinusButton.addEventListener("click", () => {
            this.#itemQuantityDown(cartItem, itemIndex);
        });

        let deleteButton = newNode.querySelector("#shoppingCartItemDeleteButton");
        deleteButton.addEventListener("click", () => {
            this.#cartData.splice(this.#cartData.findIndex(item => item === cartItem), 1);
            this.#displayCartItems();
        });
        return newNode;
    }

    #itemQuantityUp(cartItem, itemIndex) {
        cartItem.purchaseQuantity++;
        this.#cartToCookie();
        this.#renderCartItem(itemIndex);
    }

    #itemQuantityDown(cartItem, itemIndex) {
        cartItem.purchaseQuantity--;

        if (cartItem.purchaseQuantity == 0) {
            this.#cartData.splice(this.#cartData.indexOf(cartItem), 1);
            this.#cartToCookie();
            this.#displayCartItems();
        } else {
            this.#cartToCookie();
            this.#renderCartItem(itemIndex);
        }
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
}

export default ShoppingCart;