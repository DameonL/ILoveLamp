import FetchHtmlElement from "./FetchHtmlElement.js";

class ShopList extends FetchHtmlElement {
    #products = null;
    #productCount = -1;
    #startIndex = 0;
    #productsPerPage = 12;
    #shopListProductRender = null;

    constructor() {
        super();

        this.addHtmlLoadedHandler(() => {
            
            this.#loadShopPage();
        });
    }

    async #loadShopPage() {
        this.#getStartIndex();

        this.#shopListProductRender = this.querySelector("#shopListProductRender");
        let productThumbTemplate = this.querySelector("#productThumb").content.firstElementChild;
        this.#products = await this.#getProductData();
        this.#renderProductData(productThumbTemplate);
        this.#renderPageButtons();
    }

    #getStartIndex = () => {
        let params = new URLSearchParams(window.location.hash.replace("#", ""));
        if (params.has("startIndex")) {
            this.#startIndex = Number(params.get("startIndex"));
        }
    }

    #renderProductData(productThumbTemplate) {
        this.#shopListProductRender.innerHTML = "";
        for (let product of this.#products) {
            let thumb = productThumbTemplate.cloneNode(true);
            let productId = product.name.match(/\w*$/);
            thumb.querySelector(`[boundField="name"]`).innerText = product.fields.Name.stringValue;
            thumb.querySelector(`[boundField="image"]`).src = `./img/products/${productId}/${product.fields.Variants.arrayValue.values[0].mapValue.fields.Images.arrayValue.values[0].stringValue}.jpg`;

            let price = "";
            if (product.fields.Variants.arrayValue.values[0].mapValue.fields.Price.doubleValue) {
                price = product.fields.Variants.arrayValue.values[0].mapValue.fields.Price.doubleValue;
            }
            else if (product.fields.Variants.arrayValue.values[0].mapValue.fields.Price.integerValue) {
                price = product.fields.Variants.arrayValue.values[0].mapValue.fields.Price.integerValue;
            }

            price = price.toString();
            let priceDollars = price;
            let priceCents = "00";
            if (price.indexOf(".") > -1) {
                priceDollars = price.substring(0, price.indexOf("."));
                priceCents = price.substring(price.indexOf(".") + 1);
            }

            thumb.id = productId;
            thumb.querySelector(`[boundField="priceDollars"]`).innerText = priceDollars;
            thumb.querySelector(`[boundField="priceCents"]`).innerText = priceCents;
            thumb.addEventListener("click", () => {
                let params = new URLSearchParams(window.location.hash.replaceAll("#", ""));
                params.set("page", "Product");
                params.append("product", productId);
                window.location.hash = params.toString();
            });
            this.#shopListProductRender.appendChild(thumb);
        }
    }

    async #getProductData() {
        let productCount = await fetch("https://firestore.googleapis.com/v1/projects/i-love-lamp-40190/databases/(default)/documents/ProductsSettings/Settings");
        productCount = await productCount.json();
        productCount = Number(productCount.fields.ProductCount.integerValue);
        this.#productCount = productCount;

        let totalPages = Math.ceil(this.#productCount / this.#productsPerPage);
        if (this.#startIndex > ((totalPages - 1) * this.#productsPerPage)) {
            this.#startIndex = ((totalPages - 1) * this.#productsPerPage);
        }
        if (this.#startIndex < 0) this.#startIndex = 0;

        let loadDataFromQuery = async (query) => {
            let loadedPromise = new Promise((resolve, reject) => {
                const request = new XMLHttpRequest();
                request.onreadystatechange = function () {
                    if (this.readyState != 4) return;

                    if (this.status == 200) {
                        resolve(request.response);
                    } else {
                        console.error(request.response);
                        console.trace();
                        reject(request.response);
                    }
                };

                request.open("POST", `https://firestore.googleapis.com/v1/projects/i-love-lamp-40190/databases/(default)/documents:runQuery`, true);
                request.setRequestHeader('Content-Type', 'application/json');
                request.send(query);
            });
            return loadedPromise;
        }

        let data = await loadDataFromQuery(JSON.stringify(
            {
                structuredQuery:
                {
                    from: [
                        {
                            collectionId: 'Products',
                            allDescendants: true
                        }
                    ],
                    where: {
                        compositeFilter: {
                            filters: [
                                {
                                    unaryFilter: {
                                        field: {
                                            fieldPath: 'Description'
                                        },
                                        op: 'IS_NOT_NULL',
                                    }
                                }
                            ], op: 'AND'
                        }
                    },
                    limit: this.#productsPerPage,
                    offset: this.#startIndex
                }
            }
        ));

        data = JSON.parse(data);
        let products = [];
        let indexElement = document.querySelector("ilovelamp-index");
        for (let item of data) {
            if (item.document) {
                products.push(item.document);
                indexElement.addProductToCache(item.document)
            }
        }

        return products;
    }

    #renderPageButtons() {
        let pageChanged = () => {
            let params = new URLSearchParams(window.location.hash.substring(1));
            params.set("startIndex", this.#startIndex);
            window.location.hash = params.toString();
        }

        let totalPages = Math.ceil(this.#productCount / this.#productsPerPage);
        let currentPage = Math.floor((this.#startIndex / this.#productCount) * totalPages);

        let pageButtonTemplate = this.querySelector("#shopListPagesTemplate");
        let pageButtonDiv = pageButtonTemplate.content.firstElementChild.cloneNode(true);
        this.after(pageButtonDiv);
        let shopListPagesFirst = pageButtonDiv.querySelector("#shopListPagesFirst");
        shopListPagesFirst.addEventListener("click", () => {
            this.#startIndex = 0;
            pageChanged();
        });
        let shopListPagesPrevious = pageButtonDiv.querySelector("#shopListPagesPrevious");
        shopListPagesPrevious.addEventListener("click", () => {
            if (currentPage > 0) {
                this.#startIndex = (currentPage - 1) * this.#productsPerPage;
                pageChanged();
            }
        });
        let shopListPagesNext = pageButtonDiv.querySelector("#shopListPagesNext");
        shopListPagesNext.addEventListener("click", () => {
            if (currentPage + 1 < totalPages) {
                this.#startIndex = (currentPage + 1) * this.#productsPerPage;
                pageChanged();
            }
        });
        let shopListPagesLast = pageButtonDiv.querySelector("#shopListPagesLast");
        shopListPagesLast.addEventListener("click", () => {
            this.#startIndex = (totalPages - 1) * this.#productsPerPage;
            pageChanged();
        });

        let shopListPagesPageInfo = pageButtonDiv.querySelector("#shopListPagesPageInfo");
        shopListPagesPageInfo.innerText = `Page ${currentPage + 1} of ${totalPages}`;
    }
}

export default ShopList;