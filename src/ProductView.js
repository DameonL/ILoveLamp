import ItemBinder from "./ItemBinder.js";

class ProductView extends HTMLElement {
    #productId = "";
    #product = null;
    #selectedVariantIndex = 0;
    get #selectedVariant() {
        return this.#product.fields.Variants.arrayValue.values[this.#selectedVariantIndex];
    }

    constructor() {
        super();
        window.addEventListener("hashchange", this.#hashChanged);
        this.#hashChanged();
    }

    #hashChanged = () => {
        if (this.getRootNode().nodeName != "#document") {
            window.removeEventListener("hashchange", this.#hashChanged);
            return;
        }

        let params = new URLSearchParams(window.location.hash.substring(1));
        if (params.has("product")) {
            this.#productId = params.get("product");
            this.render();
            this.style.display = "";
        } else {
            this.style.display = "none";
        }
    }

    async render() {
        let pageHtml = await fetch("../pages/ProductView.html");
        this.innerHTML = await pageHtml.text();
        let product = await this.getProductData(this.#productId);
        this.#product = product;

        let quantitySelector = document.querySelector(`#quantitySelector`);
        for (var i = 1; i <= 50; i++) {
            let optionElement = document.createElement("option");
            optionElement.innerText = i;
            optionElement.value = i;
            quantitySelector.appendChild(optionElement);
        }

        let addToCartFunction = () => {
            let cart = document.querySelector("shopping-cart");
            if (quantitySelector.value < 1) return;
            cart.addToCart({ productId: this.#productId, variant: this.#selectedVariantIndex, purchaseQuantity: quantitySelector.value });
        }

        document.querySelector(".addToCartButton").addEventListener("click", addToCartFunction);

        ItemBinder.bindItemToElement(product.fields, this, this.#productId);

        let mainImage = document.querySelector("#mainProductImage");
        let firstVariantImage = document.querySelector(`img[boundField="Variants.arrayValue.values.mapValue.fields.Images.arrayValue.values.stringValue"]`);
        if (firstVariantImage) mainImage.src = firstVariantImage.src;

        let variants = document.querySelectorAll(`.productVariant`);
        let changeSelectedVariant = (newIndex) => {
            this.#selectedVariantIndex = newIndex;
            document.querySelector("#selectedVariantPrice").innerText = this.#selectedVariant.mapValue.fields.Price.doubleValue;

            let pricesToFormat = document.querySelectorAll("[formatItemPrice]").values();
            for (let priceToFormat of pricesToFormat) {
                let splitText = priceToFormat.innerText.split(".");
                let leftSpan = document.createElement("span");
                let rightSpan = document.createElement("span");
                leftSpan.className = "productPriceLeft";
                rightSpan.className = "productPriceRight";
                leftSpan.innerText = splitText[0];
                rightSpan.innerText = `.${splitText[1]}`;
                priceToFormat.innerText = "";
                priceToFormat.appendChild(leftSpan);
                priceToFormat.appendChild(rightSpan);
            }

            for (let variantIndex in variants) {
                let variant = variants[variantIndex];
                if (!variant.querySelector) continue;

                let variantImage = variant.querySelector(`img[boundField="Variants.arrayValue.values.mapValue.fields.Images.arrayValue.values.stringValue"]`);
                let variantName = variant.querySelector(`div[boundField="Variants.arrayValue.values.mapValue.fields.Name.stringValue"]`).innerText;
                if (variantIndex == this.#selectedVariantIndex) {
                    variantImage.classList.add("selectedVariant");
                    document.querySelector(`#selectedVariantName`).innerText = variantName;
                    let propertiesElement = document.querySelector("#selectedVariantProperties");
                    propertiesElement.setAttribute("boundarrayindex", variantIndex);
                    ItemBinder.bindItemToElement(product.fields, propertiesElement, this.#productId);
                }
                else {
                    variantImage.classList.remove("selectedVariant");
                }
            }
        }

        for (let variantIndex in variants) {
            let variant = variants[variantIndex];
            if (!variant.querySelector) continue;
            let variantImage = variant.querySelector(`img[boundField="Variants.arrayValue.values.mapValue.fields.Images.arrayValue.values.stringValue"]`);

            variant.addEventListener("mouseenter", () => {
                mainImage.src = variantImage.src;
            });

            variant.addEventListener("click", () => {
                changeSelectedVariant(variantIndex);
            });
        }

        changeSelectedVariant(this.#selectedVariantIndex);
    }

    async getProductData() {
        let url = `https://firestore.googleapis.com/v1/projects/i-love-lamp-40190/databases/(default)/documents/Products/${this.#productId}`;
        let data = await fetch(url);
        data = await data.json();
        return data;
    }
}

export default ProductView;