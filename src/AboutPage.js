import FetchHtmlElement from "./FetchHtmlElement.js";

class AboutPage extends FetchHtmlElement {
    constructor() {
        super();
        this.addHtmlLoadedHandler(() => this.#loadPage());
    }

    async #loadPage() {
        var observerOptions = {
            root: null,
            threshold: 0,
            rootMargin: '0px'
        };
        
        var targets = this.querySelectorAll('.aboutTextBox, .aboutPageBackground');
        var observer = new IntersectionObserver(
           entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("aboutTextBoxFadeIn");
                } else {
                    entry.target.classList.remove("aboutTextBoxFadeIn");
                }
            });
        }, observerOptions);
        for (var textBox of targets.entries()) {
            observer.observe(textBox[1]);
        }        
    }
}

export default AboutPage;