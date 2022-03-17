import ILoveLampNavbar from "./src/ILoveLampNavbar.js";
import ShopList from "./src/ShopList.js";
import ProductView from "./src/ProductView.js";
import ShoppingCart from "./src/ShoppingCart.js";
customElements.define('shop-list', ShopList,);
customElements.define('product-view', ProductView);
customElements.define('shopping-cart', ShoppingCart);
customElements.define('ilovelamp-navbar', ILoveLampNavbar);

let pageRenderer = document.querySelector("#pageRenderer");
let shopName = document.head.querySelector("title").innerText;

window.addEventListener("hashchange", hashChanged);
window.addEventListener("popstate", hashChanged);
let pageIds = {
    "": "pages/index.html",
    "Shop": "pages/ShopList.html",
    "About": "pages/About.html"
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

    var setInnerHTML = function (elm, html) {
        elm.innerHTML = html;
        Array.from(elm.querySelectorAll("script")).forEach(oldScript => {
            const newScript = document.createElement("script");
            Array.from(oldScript.attributes)
                .forEach(attr => newScript.setAttribute(attr.name, attr.value));
            newScript.appendChild(document.createTextNode(oldScript.innerHTML));
            oldScript.parentNode.replaceChild(newScript, oldScript);
        });
    }

    let navbarTarget = document.createElement("div");
    let pageHtml = await fetch(url);
    pageHtml = await pageHtml.text();
    setInnerHTML(pageRenderer, pageHtml);
    if (pageRenderer.querySelector("title")) {
        document.title = `${shopName} - ${pageRenderer.querySelector("title").innerText}`;
    } else {
        document.title = shopName;
    }
}

hashChanged();