import FetchHtmlElement from "./FetchHtmlElement.js";

class ContactPage extends FetchHtmlElement {
    constructor() {
        super();
        this.addHtmlLoadedHandler(() => this.#pageLoaded());
    }

    async #pageLoaded() {
        let submitButton = this.getElementById("submitButton");
    }
}

export default ContactPage;