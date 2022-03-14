class ShopList extends HTMLElement {
    #products = null;
    #startIndex = 0;

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
                        console.log(this.status);
                        resolve(xhr.response);
                    } else {
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
                    limit: 25,
                    offset: this.#startIndex
                }
            }
        ));

        data = JSON.parse(data);
        let products = [];
        for (let item of data) {
            if (item.document) products.push(item.document);
        }

        console.log(products);
        return products;

//        let data = await fetch("https://firestore.googleapis.com/v1/projects/i-love-lamp-40190/databases/(default)/documents/Products");
//        data = await data.json();
//        return data.documents;
    }

}


export default ShopList;