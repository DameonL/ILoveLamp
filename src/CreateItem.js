import CreateItemBinder from "./CreateItemBinder.js";

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
        for (let child of childElements) {
            if (getParentField(child) != field) continue;
            let newValue = {};
            newValue[child.getAttribute("fieldType")] = processFields(child);
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

let itemBinder = new CreateItemBinder(document.querySelector(`[fieldType="document"]`));

document.querySelector("#createButton").addEventListener("click", () => {
    let serializedItem = itemBinder.getItemFromDocument();
    console.log(serializedItem);
    return;

    var request = new XMLHttpRequest();
    var url = "https://firestore.googleapis.com/v1/projects/amiracle-cleaners/databases/(default)/documents/products";
    request.open("POST", url, true);
    request.setRequestHeader("Content-Type", "application/json");
    request.onreadystatechange = function () {
        if (request.readyState === 4 && request.status === 200) {
            location.reload();
        }
    };
    request.send(JSON.stringify(serializedItem));
});