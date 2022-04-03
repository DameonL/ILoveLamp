import FetchHtmlElement from "./FetchHtmlElement.js";
import ItemBinder from "./ItemBinder.js";

class ProductView extends FetchHtmlElement {
    #productId = "";
    #product = null;
    #selectedVariantIndex = 0;

    get selectedVariant() {
        return this.#product.fields.Variants.arrayValue.values[this.#selectedVariantIndex];
    }

    constructor() {
        super();

        this.addHtmlLoadedHandler(() => {
            this.#loadPage();
            this.#loadProductId();
        });
    }

    #loadProductId() {
        let params = new URLSearchParams(window.location.hash.replace("#", ""));
        if (params.has("product")) {
            this.#productId = params.get("product");
            if (this.#productId === "") { window.history.back(); return; }
            this.#render();
        } else {
            window.location.hash = "";
        }
    }

    async #loadPage() {
        let quantitySelector = this.querySelector(`#quantitySelector`);
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

        this.querySelector(".addToCartButton").addEventListener("click", addToCartFunction);
    }

    async #render() {
        let indexElement = document.querySelector("ilovelamp-index");
        let product = await indexElement.getProduct(this.#productId);
        if (product.error) { window.history.back(); return; }
        this.#product = product;
        ItemBinder.bindItemToElement(product.fields, this, this.#productId);
        this.#hookVariants();
        this.#changeSelectedVariant(this.#selectedVariantIndex);
    }

    #hookVariants() {
        let mainImage = document.querySelector("#mainProductImage");
        let firstVariantImage = document.querySelector(`img[boundField="Variants.arrayValue.values.mapValue.fields.Images.arrayValue.values.stringValue"]`);
        if (firstVariantImage) mainImage.src = firstVariantImage.src;
        let variants = document.querySelectorAll(`.productVariant`);
        for (let variantIndex in variants) {
            let variant = variants[variantIndex];
            if (!variant.querySelector) continue;
            let variantImage = variant.querySelector(`img[boundField="Variants.arrayValue.values.mapValue.fields.Images.arrayValue.values.stringValue"]`);

            variant.addEventListener("mouseenter", () => {
                mainImage.src = variantImage.src;
            });

            variant.addEventListener("click", () => {
                this.#changeSelectedVariant(variantIndex);
            });
        }
    }

    #changeSelectedVariant(newIndex) {
        this.#selectedVariantIndex = newIndex;
        let imageSelection = document.querySelector(".productDetails");
        imageSelection = imageSelection.querySelector(`[boundField="Variants.arrayValue.values"]`);
        imageSelection.setAttribute("boundArrayIndex", newIndex);
        imageSelection.firstElementChild.innerHTML = "";
        ItemBinder.bindItemToElement(this.#product.fields, imageSelection, this.#productId);
        this.#renderVariants();
        document.querySelector("#selectedVariantPrice").innerText = this.selectedVariant.mapValue.fields.Price.doubleValue;
        let mainImage = document.querySelector("#mainProductImage");

        let itemImages = document.querySelector(".productImageList").querySelectorAll("img");
        for (let itemImage of itemImages) {
            itemImage.addEventListener("mouseenter", () => {
                mainImage.src = itemImage.src;
            });
            itemImage.addEventListener("click", () => {
                mainImage.src = itemImage.src;
            });
        }
        this.#formatPrices();

    }

    #renderVariants() {
        let variants = document.querySelectorAll(`.productVariant`);
        for (let variantIndex in variants) {
            let variant = variants[variantIndex];
            if (!variant.querySelector) continue;

            let variantImage = variant.querySelector(`img[boundField="Variants.arrayValue.values.mapValue.fields.Images.arrayValue.values.stringValue"]`);
            let variantName = variant.querySelector(`div[boundField="Variants.arrayValue.values.mapValue.fields.Name.stringValue"]`).innerText;
            if (variantIndex == this.#selectedVariantIndex) {
                variantImage.classList.add("selectedVariant");
                document.querySelector(`#selectedVariantName`).innerText = variantName;
                let propertiesElement = document.querySelector("#selectedVariantProperties");
                propertiesElement.parentElement.setAttribute("boundarrayindex", variantIndex);
                ItemBinder.bindItemToElement(this.#product.fields, propertiesElement, this.#productId);
            }
            else {
                variantImage.classList.remove("selectedVariant");
            }
        }
    }

    #formatPrices() {
        let pricesToFormat = document.querySelectorAll("[formatItemPrice]").values();
        for (let priceToFormat of pricesToFormat) {
            let splitText = priceToFormat.innerText.split(".");
            let leftSpan = document.createElement("span");
            let rightSpan = document.createElement("span");
            leftSpan.className = "productPriceLeft";
            rightSpan.className = "productPriceRight";
            leftSpan.innerText = splitText[0];
            if (splitText[1].length == 1) splitText[1] = `${splitText[1]}0`;
            rightSpan.innerText = `.${splitText[1]}`;
            priceToFormat.innerText = "";
            priceToFormat.appendChild(leftSpan);
            priceToFormat.appendChild(rightSpan);
        }
    }
}

export default ProductView;