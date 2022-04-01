import FetchHtmlElement from "./FetchHtmlElement.js";

class ContactPage extends FetchHtmlElement {
    constructor() {
        super();
        this.addHtmlLoadedHandler(() => this.#loadPage());
    }

    async #loadPage() {
    }
}

export default ContactPage;