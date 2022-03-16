const options = {
    root: null,
    threshold: 0.25, // 0 - 1 this work as a trigger. 
    rootMargin: '0px'
};

const targets = document.querySelectorAll('.aboutTextBox');
const observer = new IntersectionObserver(
   entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add("aboutTextBoxFadeIn");
        } else {
            entry.target.classList.remove("aboutTextBoxFadeIn");
        }
    });
}, options);
for (let textBox of targets.entries()) {
    observer.observe(textBox[1]);
}
