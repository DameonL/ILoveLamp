import ILoveLampIndex from "./src/ILoveLampIndex.js"
import ShopList from "./src/ShopList.js";
import ProductView from "./src/ProductView.js";
import ShoppingCart from "./src/ShoppingCart.js";
import AboutPage from "./src/AboutPage.js";
import ContactPage from "./src/ContactPage.js";
import FetchHtmlElement from "./src/FetchHtmlElement.js";

let elementRoutes = {
    "shop-list": { elementClass: ShopList },
    "about-page": { elementClass: AboutPage },
    "product-view": { elementClass: ProductView },
    "shopping-cart": { elementClass: ShoppingCart },
    "contact-page": { elementClass: ContactPage },
    "ilovelamp-navbar": { elementClass: FetchHtmlElement },
    "ilovelamp-index": { elementClass: ILoveLampIndex },
};

for (let routeIndex in elementRoutes) {
    let route = elementRoutes[routeIndex];
    customElements.define(routeIndex, route.elementClass);
}