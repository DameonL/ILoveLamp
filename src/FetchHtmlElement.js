class FetchHtmlElement extends HTMLElement {
    static get observedAttributes() { return ["src"]; }

    #pageUrl = null;
    
    #onHtmlLoaded = null;
    get onHtmlLoaded() { return this.#onHtmlLoaded; }
    set onHtmlLoaded(value) { this.#onHtmlLoaded = value; }

    constructor() {
        super();

        if (this.getAttribute("src")) {
            this.attributeChangedCallback("src", "", this.getAttribute("src"));
        }
    }

    attributeChangedCallback(attributeName, oldValue, newValue) {
        if ((attributeName == "src") && (oldValue !== newValue)) {
            if (newValue) {
                this.#pageUrl = newValue;
                this.reloadPage(newValue);
            }
        }
    }

    async reloadPage(pageUrl) {
        this.innerHtml = "";
        let pageHtml = await fetch(pageUrl);
        this.innerHTML = await pageHtml.text();
        this.updateTitle();
        if (this.onHtmlLoaded) this.onHtmlLoaded();
    }

    updateTitle() {
        let pageTitle = this.querySelector("title");
        if (pageTitle && pageTitle.innerText) {
            document.title = `${document.title} - ${pageTitle.innerText}`;
        }
    }
}

export default FetchHtmlElement;