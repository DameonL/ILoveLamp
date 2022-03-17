import ILoveLampNavbar from "./src/ILoveLampNavbar.js";
import ShopList from "./src/ShopList.js";
import ProductView from "./src/ProductView.js";
import ShoppingCart from "./src/ShoppingCart.js";
import AboutPage from "./src/AboutPage.js";
customElements.define('shop-list', ShopList,);
customElements.define('product-view', ProductView);
customElements.define('shopping-cart', ShoppingCart);
customElements.define('ilovelamp-navbar', ILoveLampNavbar);
customElements.define('about-page', AboutPage);

let pageRenderer = document.querySelector("#pageRenderer");
let shopName = document.head.querySelector("title").innerText;

window.addEventListener("hashchange", hashChanged);
window.addEventListener("popstate", hashChanged);

let pageRoutes = {
    "": "shop-list",
    "Shop": "shop-list",
    "About": "about-page",
    "Product": "product-view"
}

function hashChanged() {
    let params = window.location.hash.replaceAll("#", "");
    console.log(params);
    params = new URLSearchParams(params);
    let pageId = "";
    if (params.has("page")) {
        console.log("Page");
        pageId = params.get("page");
    }
    loadPage(pageId);
}

let url = "";
let loadPage = async (pageId = "") => {
    pageRenderer.innerHTML = "";
    let instance = document.createElement(pageRoutes[pageId]);
    pageRenderer.appendChild(instance);


    if (pageRenderer.querySelector("title")) {
        document.title = `${shopName} - ${pageRenderer.querySelector("title").innerText}`;
    } else {
        document.title = shopName;
    }
}

hashChanged();