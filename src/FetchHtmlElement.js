class FetchHtmlElement extends HTMLElement {
    #onHtmlLoadedHandlers = [];
    #contentDiv = null;

    static get observedAttributes() { return ["src"]; }

    constructor() {
        super();

        if (this.getAttribute("src")) {
            this.attributeChangedCallback("src", "", this.getAttribute("src"));
        }
    }

    addHtmlLoadedHandler(handler) {
        this.#onHtmlLoadedHandlers.push(handler);
    }

    removeHtmlLoadedHandler(handler) {
        if (!this.#onHtmlLoadedHandlers.includes(handler)) return;

        this.#onHtmlLoadedHandlers.splice(this.#onHtmlLoadedHandlers.indexOf(handler), 1);
    }

    async reloadPage(pageUrl) {
        if (!this.#contentDiv) {
            this.#contentDiv = document.createElement("div");
            this.appendChild(this.#contentDiv);
        }

        this.#contentDiv.innerHtml = "";
        let pageHtml = await fetch(pageUrl);
        this.#contentDiv.innerHTML = await pageHtml.text();
        this.#updateTitle();
        for (let handler of this.#onHtmlLoadedHandlers) {
            handler();
        }
    }

    attributeChangedCallback(attributeName, oldValue, newValue) {
        if ((attributeName == "src") && (oldValue !== newValue)) {
            if (newValue) {
                this.reloadPage(newValue);
            }
        }
    }

    #updateTitle() {
        let pageTitle = this.querySelector("title");
        if (pageTitle && pageTitle.innerText) {
            document.title = `${document.title} - ${pageTitle.innerText}`;
        }
    }
}

export default FetchHtmlElement;