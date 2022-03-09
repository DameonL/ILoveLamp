class CreateItemBinder {
    #boundItem = {};
    #boundElement = null;
    #productId = "";

    constructor(elementToBind) {
        this.#boundElement = elementToBind;
        let boundElements = elementToBind.querySelectorAll("[boundField]");
        for (let boundElement of boundElements) {
            let fieldPath = boundElement.getAttribute("boundField");
            if (fieldPath.endsWith(".values") || fieldPath.endsWith(".fields")) {
                let fieldAddButtonId = boundElement.getAttribute("fieldAddButton");
                let fieldAddButton = elementToBind.querySelector(`#${fieldAddButtonId}`);
                let fieldTemplateId = boundElement.getAttribute("fieldTemplate");
                let childTemplate = elementToBind.querySelector(`#${fieldTemplateId}`).content.firstElementChild;
                fieldAddButton.addEventListener("click", () => {
                    let newChildItem = childTemplate.cloneNode(true);
                    boundElement.appendChild(newChildItem);
                    let childBinder = new CreateItemBinder(newChildItem);
                });
            }
        }
    }

    getItemFromDocument() {
        let boundElements = this.#boundElement.querySelectorAll("[boundField]");
        console.log(boundElements);
        this.#boundItem = {};
        for (let boundElement of boundElements) {
            let elementPath = boundElement.getAttribute("boundField").split(".");
            let currentField = this.#boundItem;
            for (let pathIndex in elementPath) {
                if (!currentField[elementPath[pathIndex]]) {
                    let pathItem = {};
                    currentField[elementPath[pathIndex]] = pathItem;
                    currentField = currentField[elementPath[pathIndex]];
                }
            }
        }
        console.log(this.#boundItem);
    }
}

export default CreateItemBinder;