class ILoveLampIndex extends HTMLElement {
    #pageRoutes = null;
    #pageTitle = null;
    #productCache = {};

    async getProduct(productId, forceRefresh = false) {
        if (!this.#productCache[productId] || forceRefresh) {
            let url = `https://firestore.googleapis.com/v1/projects/i-love-lamp-40190/databases/(default)/documents/Products/${productId}`;
            let product = await fetch(url);
            product = await product.json();
            this.addProductToCache(product);
            return product;
        } else {
            let cacheItem = this.#productCache[productId];
            if ((Date.now() - cacheItem.lastRefreshTime) > (30 * 60000)) {
                cacheItem.product = this.getProduct(productId, true);
            }
            return cacheItem.product;
        }
    }

    addProductToCache(product) {
        let productId = product.name.match(/\w*$/);
        let cacheItem = {
            product: product,
            lastRefreshTime: Date.now()
        };

        this.#productCache[productId] = cacheItem;
    }

    constructor() {
        super();

        this.#pageTitle = document.title;
        this.#pageRoutes = JSON.parse(this.getAttribute("pageRoutes").trim());
        window.addEventListener("popstate", () => this.#hashChanged());
        this.#hashChanged();
    }

    #hashChanged() {
        let params = window.location.hash.replaceAll("#", "");
        params = new URLSearchParams(params);
        let pageId = "";
        if (params.has("page")) {
            pageId = params.get("page");
        }
        this.#loadPage(pageId);
    }

    async #loadPage(pageId = "") {
        let route = this.#pageRoutes[pageId];
        if (!route) {
            return;
        }

        let pageInstance = this.#renderRoute(route);
    }

    #renderRoute(route) {
        document.title = this.#pageTitle;
        let pageRenderer = document.getElementById(this.getAttribute("renderer"));
        pageRenderer.innerHTML = "";
        let instance = document.createElement(route.elementName);
        instance.setAttribute("src", route.src);
        pageRenderer.appendChild(instance);
        return instance;
    }
}

export default ILoveLampIndex;