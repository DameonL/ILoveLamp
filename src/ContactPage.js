import FetchHtmlElement from "./FetchHtmlElement.js";

class ContactPage extends FetchHtmlElement {
    constructor() {
        super();
        this.addHtmlLoadedHandler(() => { this.#pageLoaded(); });
    }

    async #pageLoaded() {
        let submitButton = this.querySelector("#submitButton");
        submitButton.addEventListener("click", () => {
            if (!this.#validateForm()) {
                alert("Please complete all fields before submitting.");
                return;
            }

            submitButton.disabled = true;
            this.querySelector(`[name="name"]`).disabled = true;
            this.querySelector(`[name="email"]`).disabled = true;
            this.querySelector(`[name="topic"]`).disabled = true;
            this.querySelector(`[name="message"]`).disabled = true;
            this.querySelector(`.submitButtonSpinner`).style.display = "block";

            setTimeout(() => {
                this.innerHtml = "";
                this.innerText = "Your message has been sent, thank you very much!";
            }, 5000);
        });
    }

    #validateForm() {
        let isValid = true;

        if (!this.querySelector(`[name="name"]:valid`)) isValid = false;
        if (!this.querySelector(`[name="email"]:valid`)) isValid = false;
        if (!this.querySelector(`[name="topic"]:valid`)) isValid = false;
        if (!this.querySelector(`[name="message"]:valid`)) isValid = false;

        return isValid;
    }
}

export default ContactPage;