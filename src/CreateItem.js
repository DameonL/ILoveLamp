import ItemBinder from "./ItemBinder.js";

function processFields(startElement) {
    console.log(startElement);
    let startFieldType = startElement.getAttribute("fieldType");
    let newItem = {};
    let boundFields = null;
    if ((startFieldType == "mapValue") || (startFieldType == "document")) {
        newItem.fields = {};
        boundFields = startElement.querySelectorAll("[boundField]");
    } else {
        boundFields = [startElement];
    }

    for (let field of boundFields) {
        let parentField = getParentField(field);
        console.log(field);

        let fieldName = field.getAttribute("boundField");
        let fieldType = field.getAttribute("fieldType");
        let fieldItem = fieldTypeHandlers[fieldType](field);
        console.log(fieldItem);
        if ((startFieldType == "mapValue") || (startFieldType == "document")) {
            newItem.fields[fieldName] = fieldItem;
        } else {
            newItem[fieldName] = fieldItem;
        }
    }

    return newItem;
}

function getParentField(field) {
    let currentElement = field;
    let parentFieldTypes = [
        "document",
        "arrayValue",
        "mapValue"
    ];

    while (currentElement) {
        currentElement = currentElement.parentElement;

        if (!currentElement) break;

        let fieldType = currentElement.getAttribute("fieldType");
        if (parentFieldTypes.includes(fieldType)) return currentElement;
    }

    return null;
}

let fieldTypeHandlers = {
    "stringValue" : (field) => {
        let output = {};
        output.stringValue = field.value;
        return output;
    },
    "doubleValue" : (field) => {
        let output = {};
        output.doubleValue = field.valueAsNumber;
        return output;
    },
    "arrayValue" : (field) => {
        let output = {};
        output.arrayValue = {};
        output.arrayValue.values = [];
        let childElements = field.querySelectorAll(`[boundField]`);
        for (let childIndex in childElements) {
            let childElement = childElements[childIndex];
            if (getParentField(childElement) != field) continue;
            let newValue = {};
            newValue[childElement.getAttribute("fieldType")] = processFields(childElement);
            output.arrayValue.values.push(newValue);
        }

        return output;
    },
    "mapValue" : (field) => {
        let output = {}
        output.mapValue = processFields(field);
        return output;
    }
}

let bindingElement = document.querySelector(`[fieldType="document"]`);
ItemBinder.bindForRead(bindingElement);

document.querySelector("#createButton").addEventListener("click", () => {
    let serializedItem = itemBinder.getItemFromElement(bindingElement);
    let postItem = {};
    postItem.fields = serializedItem;
    console.log(serializedItem);

    var request = new XMLHttpRequest();
    var url = "https://firestore.googleapis.com/v1/projects/i-love-lamp-40190/databases/(default)/documents/Products";
    request.open("POST", url, true);
    request.setRequestHeader("Content-Type", "application/json");
    request.onreadystatechange = function () {
        if (request.readyState === 4 && request.status === 200) {
            location.reload();
        }
    };
    request.send(JSON.stringify(postItem));
});