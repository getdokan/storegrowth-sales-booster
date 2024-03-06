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

/**
 * Default data of create bump.
 */
export const createBumpForm = {
    name_of_order_bump: '',
    target_products: [],
    target_categories: [],
    bump_schedule: ['daily'],
    smart_offer: false,
    offer_product: '',
    offer_type: [],
    bump_type: 'products',
    offer_amount: '',
    box_border_style: 'solid',
    box_border_color: '#32DBBE',
    box_top_margin: 1,
    box_bottom_margin: 1,
    discount_background_color: '#E1FFF4',
    discount_text_color:'#02AC6E',
    discount_font_size: '13',
    product_description_text_color: '#080814',
    product_description_font_size: '18',
    accept_offer_background_color: '#e08b22ff',
    accept_offer_text_color: '#000000',
    accept_offer_font_size: '14',
    offer_description_background_color:'#8fa68bff',
    offer_description_text_color:'#000000',
    offer_description_font_size: '14',
    offer_image_url: bump_save_url.image_folder+'/icon.png',
    offer_product_title:"Please select your offer product",
    offer_product_id: 0,
    offer_discount_title:'% off only for you!',
    offer_fixed_price_title:'$ Just Only',
    product_description:'Add product description please',
    selection_title:'Add selection title please',
    offer_description:'Add offer description please',
    offer_product_regular_price : 0
};
