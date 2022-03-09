class ItemBinder {
    #boundItem = null;
    #boundElement = null;
    #productId = "";

    constructor(itemToBind, elementToBind, productId, bindingPath = "") {
        this.#boundItem = itemToBind;
        this.#boundElement = elementToBind;
        this.#productId = productId;
        this.#bindFields(bindingPath);
    }

    #bindFields(bindingPath) {
        let objectKeys = Object.keys(this.#boundItem.fields);
        for (let key of objectKeys) {
            let fieldPath = bindingPath;
            if (fieldPath != "") fieldPath += ".";
            fieldPath += key;
            let boundField = this.#boundItem.fields[key];
            let boundElements = this.#boundElement.querySelectorAll(`[boundField="${fieldPath}"]`);

            for (let boundElement of boundElements) {
                this.#bindFieldToElement(boundField, boundElement, fieldPath)
            }
        }
    }

    #bindFieldToElement(boundField, boundElement, fieldPath) {
        if ((boundElement.nodeName === "DIV") || (boundElement.nodeName === "SPAN")) {
            if (boundField.stringValue) boundElement.innerText = boundField.stringValue;
            else if (boundField.doubleValue) boundElement.innerText = boundField.doubleValue;
            else if (boundField.intValue) boundElement.innerText = boundField.intValue;
            
        }
        if ((boundElement.nodeName === "IMG") && (boundField.stringValue)) {
            boundElement.src = `../img/products/${this.#productId}/${boundField.stringValue}.jpg`;
        }
        if (boundField.arrayValue) {
            let arrayTemplate = this.#boundElement.querySelector(`#${boundElement.getAttribute("fieldTemplate")}`);
            if (arrayTemplate) arrayTemplate = arrayTemplate.content.firstElementChild;
            else return;

            let arrayRenderType = boundElement.getAttribute("arrayRenderType");

            let boundChildFields = boundField.arrayValue.values;
            for (let boundChildField of boundChildFields) {
                let boundChildElement = arrayTemplate.cloneNode(true);
                if (boundChildField.mapValue) {
                    let childBinder = new ItemBinder(boundChildField.mapValue, boundChildElement, this.#productId, fieldPath);
                } else {
                    this.#bindFieldToElement(boundChildField, boundChildElement, fieldPath);
                }
                boundElement.appendChild(boundChildElement);
                if (arrayRenderType === "first") break;
            }
        }
    }

}

export default ItemBinder;