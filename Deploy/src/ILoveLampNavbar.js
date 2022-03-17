class ILoveLampNavbar extends HTMLElement {
    constructor() {
        super();
        this.#loadNavbar();
    }

    async #loadNavbar() {
        let navbarHtml = await fetch("./pages/ILoveLampNavbar.html");
        this.innerHTML = await navbarHtml.text();
    }
}

export default ILoveLampNavbar;