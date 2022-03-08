import ILoveLampNavbar from "../src/ILoveLampNavbar.js";
import ShopList from "../src/ShopList.js";
import ProductView from "../src/ProductView.js";
import ShoppingCart from "./src/ShoppingCart.js";
customElements.define('shop-list', ShopList);
customElements.define('product-view', ProductView);
customElements.define('shopping-cart', ShoppingCart);
customElements.define('ilovelamp-navbar', ILoveLampNavbar);

let pageRenderer = document.querySelector("#pageRenderer");
let shopName = document.head.querySelector("title").innerText;

window.addEventListener("hashchange", hashChanged);
window.addEventListener("popstate", hashChanged);
let pageIds = {
    "" : "pages/index.html",
    "shop" : "pages/shop.html"
}

function hashChanged() {
    let params = new URLSearchParams(window.location.hash.substring(1));
    let pageId = "";
    if (params.has("page")) {
        pageId = params.get("page");
    }
    loadPage(pageId);
}

let loadPage = async (pageId = "") => {
    let url = "";
    if (!(pageId in pageIds)) {
        url = "pages/404.html";
    } else {
        url = pageIds[pageId];
    }

    let navbarTarget = document.createElement("div");
    let pageHtml = await fetch(url);
    pageRenderer.innerHTML = await pageHtml.text();
    if (pageRenderer.querySelector("title")) {
        document.title = `${shopName} - ${pageRenderer.querySelector("title").innerText}`;
    } else {
        document.title = shopName;
    }
}

hashChanged();