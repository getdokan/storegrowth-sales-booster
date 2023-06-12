export const isString = (value) => typeof value === "string";

export const bumpPropertiesToWorkForHtmlEntity = [
    'name_of_order_bump',
    'offer_description',
    'offer_discount_title',
    'offer_fixed_price_title',
    'product_description',
    'selection_title',
];

export const convertToHTMLEntities = (str) =>
isString(str)
? str.replace(/[^a-zA-Z0-9]/g, function (match) {
    return "&#" + match.charCodeAt(0) + ";";
})
: str;

export const convertFromHTMLEntities = (htmlEntitiesString) => {
    if(!isString(htmlEntitiesString)){
        return htmlEntitiesString;
    }
    const parser = new DOMParser();
    const decodedString = parser.parseFromString(htmlEntitiesString, "text/html").body.textContent;
    return decodedString;
}

export const convertBumpItemTextDatasToHtmlEntities = (bumpItem) => {
    const newBumpData = {
        ...bumpItem
    };

    for (const property of bumpPropertiesToWorkForHtmlEntity) {
        if(newBumpData.hasOwnProperty(property)){
            newBumpData[property] = convertToHTMLEntities(newBumpData[property]);
        }
    }

    return newBumpData;
}


export const convertBumpItemHtmlEntitiesToTexts = (bumpItem) => {
    const newBumpData = {
        ...bumpItem
    };

    for (const property of bumpPropertiesToWorkForHtmlEntity) {
        if(newBumpData.hasOwnProperty(property)){
            newBumpData[property] = convertFromHTMLEntities(newBumpData[property]);
        }
    }

    return newBumpData;
}


