class ShopList extends HTMLElement {
    #products = null;
    #productCount = -1;
    #startIndex = 0;
    #productsPerPage = 10;
    #pageButtonsHtml = `
    <span></span>
    `;

    constructor() {
        super();

        window.addEventListener("hashchange", this.#hashChanged);
        this.#hashChanged();
        this.loadShopPage();
    }

    #hashChanged = () => {
        let params = new URLSearchParams(window.location.hash.substring(1));
        if (!params.has("product")) {
            this.style.display = "";
            if (params.has("startIndex")) {
                this.#startIndex = Number(params.get("startIndex"));
            }
        } else {
            this.style.display = "none";
        }

    }

    async loadShopPage() {
        let productThumbTemplate = document.querySelector("#productThumb").content.firstElementChild;
        this.#products = await this.getProductData();
        this.renderProductData(productThumbTemplate);
        this.renderPageButtons();
    }

    renderProductData(productThumbTemplate) {
        this.innerHTML = "";
        for (let product of this.#products) {
            let thumb = productThumbTemplate.cloneNode(true);
            let productId = product.name.match(/\w*$/);
            thumb.querySelector(`[boundField="name"]`).innerText = product.fields.Name.stringValue;
            thumb.querySelector(`[boundField="image"]`).src = `../img/products/${productId}/${product.fields.Variants.arrayValue.values[0].mapValue.fields.Images.arrayValue.values[0].stringValue}.jpg`;

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

            thumb.querySelector(`[boundField="priceDollars"]`).innerText = priceDollars;
            thumb.querySelector(`[boundField="priceCents"]`).innerText = priceCents;
            thumb.querySelector(`[boundField="image"]`).addEventListener("click", () => {
                let params = new URLSearchParams(window.location.hash.substring(1));
                params.append("product", productId);
                window.location.hash = params.toString();
            });
            this.appendChild(thumb);
        }
    }

    async getProductData() {
        let loadDataFromQuery = async (query) => {
            let loadedPromise = new Promise((resolve, reject) => {
                var xhr = new XMLHttpRequest();
                xhr.onreadystatechange = function () {
                    if (this.readyState != 4) return;

                    if (this.status == 200) {
                        resolve(xhr.response);
                    } else {
                        console.error(xhr.response);
                        console.trace();
                        reject(xhr.response);
                    }
                };

                xhr.open("POST", `https://firestore.googleapis.com/v1/projects/i-love-lamp-40190/databases/(default)/documents:runQuery`, true);
                xhr.setRequestHeader('Content-Type', 'application/json');
                xhr.send(query);
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

        let productCount = await fetch("https://firestore.googleapis.com/v1/projects/i-love-lamp-40190/databases/(default)/documents/Products/1");
        productCount = await productCount.json();
        productCount = productCount.fields.ProductCount.integerValue;
        this.#productCount = productCount;
        data = JSON.parse(data);
        let products = [];
        for (let item of data) {
            if (item.document) products.push(item.document);
        }

        return products;

        //        let data = await fetch("https://firestore.googleapis.com/v1/projects/i-love-lamp-40190/databases/(default)/documents/Products/1");
        //        data = await data.json();
        //        return data.documents;
    }

    renderPageButtons() {
        let pageChanged = () => {
            if (this.#startIndex >= this.#productCount - this.#productsPerPage) this.#startIndex = this.#productCount - this.#productsPerPage;
            if (this.#startIndex < 0) this.#startIndex = 0;

            let params = new URLSearchParams(window.location.hash.substring(1));
            params.set("startIndex", this.#startIndex);
            window.location.hash = params.toString();
        }

        let totalPages = Math.round(this.#productCount / this.#productsPerPage);
        let currentPage = Math.round((this.#startIndex / this.#productCount) * totalPages) + 1;

        let pageButtonDiv = document.querySelector("#shopListPages");
        let shopListPagesFirst = pageButtonDiv.querySelector("#shopListPagesFirst");
        shopListPagesFirst.addEventListener("click", () => {
            this.#startIndex = 0;
            pageChanged();
        });
        let shopListPagesPrevious = pageButtonDiv.querySelector("#shopListPagesPrevious");
        shopListPagesPrevious.addEventListener("click", () => {
            this.#startIndex -= this.#productsPerPage;
            if (this.#startIndex < 0) this.#startIndex = 0;
            pageChanged();
        });
        let shopListPagesNext = pageButtonDiv.querySelector("#shopListPagesNext");
        shopListPagesNext.addEventListener("click", () => {
            this.#startIndex += this.#productsPerPage;
            pageChanged();
        });
        let shopListPagesLast = pageButtonDiv.querySelector("#shopListPagesLast");
        shopListPagesLast.addEventListener("click", () => {
            this.#startIndex = this.#productCount - this.#productsPerPage;
            pageChanged();
        });

        let shopListPagesPageInfo = pageButtonDiv.querySelector("#shopListPagesPageInfo");
        shopListPagesPageInfo.innerText = `Page ${currentPage} of ${totalPages}`;
    }
}


export default ShopList;