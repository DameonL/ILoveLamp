class ShopList extends HTMLElement {
    #products = null;
    #productSizes = null;

    constructor() {
        super();

        window.addEventListener("hashchange", this.#hashChanged);
        this.loadShopPage();
        this.#hashChanged();
    }

    #hashChanged = () => {
        let params = new URLSearchParams(window.location.hash.substring(1));
        if (!params.has("product")) {
            this.style.display = "";
        } else {
            this.style.display = "none";
        }
    }

    async loadShopPage() {
        let productThumbTemplate = document.querySelector("#productThumb").content.firstElementChild;
        this.#products = await this.getProductData();
        this.renderProductData(productThumbTemplate);
    }

    renderProductData(productThumbTemplate) {
        for (let product of this.#products) {
            let thumb = productThumbTemplate.cloneNode(true);
            let productId = product.name.match(/\w*$/);
            thumb.querySelector(`[boundField="name"]`).innerText = product.fields.Name.stringValue;
            thumb.querySelector(`[boundField="image"]`).src = `../img/products/${productId}/${product.fields.Variants.arrayValue.values[0].mapValue.fields.Images.arrayValue.values[0].stringValue}.jpg`;
            thumb.querySelector(`[boundField="image"]`).addEventListener("click", () => {
                let params = new URLSearchParams(window.location.hash.substring(1));
                params.append("product", productId);
                window.location.hash = params.toString();
            })
            this.appendChild(thumb);
        }
    }
    
    async getProductData() {
        let data = await fetch("https://firestore.googleapis.com/v1/projects/i-love-lamp-40190/databases/(default)/documents/Products");
        data = await data.json();
        return data.documents;
    }
    
}


export default ShopList;