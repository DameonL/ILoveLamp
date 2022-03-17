class AboutPage extends HTMLElement {
    constructor() {
        super();

        this.#loadPage();
    }

    async #loadPage() {
        let pageHtml = await fetch("./pages/AboutPage.html");
        this.innerHTML = await pageHtml.text();

        var options = {
            root: null,
            threshold: 0, // 0 - 1 this work as a trigger. 
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
        }, options);
        for (var textBox of targets.entries()) {
            observer.observe(textBox[1]);
        }        
    }
}

export default AboutPage;