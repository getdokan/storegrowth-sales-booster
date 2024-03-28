import { __ } from '@wordpress/i18n';

export const isString = (value) => typeof value === "string";

export const bogoPropertiesToWorkForHtmlEntity = [
  "name_of_order_bogo",
  "offer_description",
  "offer_discount_title",
  "offer_fixed_price_title",
  "product_description",
  "selection_title",
];

export const convertToHTMLEntities = (str) =>
  isString(str)
    ? str.replace(/[^a-zA-Z0-9]/g, function (match) {
        return "&#" + match.charCodeAt(0) + ";";
      })
    : str;

export const convertFromHTMLEntities = (htmlEntitiesString) => {
  if (!isString(htmlEntitiesString)) {
    return htmlEntitiesString;
  }
  const parser = new DOMParser();
  const decodedString = parser.parseFromString(htmlEntitiesString, "text/html")
    .body.textContent;
  return decodedString;
};

export const convertBogoItemTextDatasToHtmlEntities = (bogoItem) => {
  const newBogoData = {
    ...bogoItem,
  };

  for (const property of bogoPropertiesToWorkForHtmlEntity) {
    if (newBogoData.hasOwnProperty(property)) {
      newBogoData[property] = convertToHTMLEntities(newBogoData[property]);
    }
  }

  return newBogoData;
};

export const convertBogoItemHtmlEntitiesToTexts = (bogoItem) => {
  const newBogoData = {
    ...bogoItem,
  };

  for (const property of bogoPropertiesToWorkForHtmlEntity) {
    if (newBogoData.hasOwnProperty(property)) {
      newBogoData[property] = convertFromHTMLEntities(newBogoData[property]);
    }
  }

  return newBogoData;
};

/**
 * Default data of create bogo.
 */
export const createBogoForm = {
  name_of_order_bogo: "",
  bogo_status: "yes",
  bogo_deal_type: "different",
  bogo_type: "products",
  minimum_quantity_required: 1,
  offer_start_date: "",
  offer_end_date: "",
  default_badge_icon_name: "bogo-icons-1",
  enable_custom_badge_image: 0,
  default_custom_badge_icon: "",
  target_products: '',
  target_categories: [],
  get_alternate_products: [],
  get_alternate_categories: [],
  exclude_products: [],
  offered_products: '',
  offer_schedule: ["daily"],
  smart_offer: false,
  get_different_product_field: "",
  offer_type: [],
  discount_amount: "",
  box_border_style: "solid",
  box_border_color: "#32DBBE",
  box_top_margin: 1,
  box_bottom_margin: 1,
  discount_background_color: "#E1FFF4",
  discount_text_color: "#02AC6E",
  discount_font_size: "13",
  product_description_text_color: "#080814",
  product_description_font_size: "18",
  accept_offer_background_color: "#e08b22ff",
  accept_offer_text_color: "#000000",
  accept_offer_font_size: "14",
  offer_description_background_color: "#8fa68bff",
  offer_description_text_color: "#000000",
  offer_description_font_size: "14",
  offer_image_url: bogo_save_url.image_folder + "/icon.png",
  offer_product_title: "Please select your offer product",
  offer_product_id: 0,
  offer_discount_title: "% off only for you!",
  offer_fixed_price_title: "$ Just Only",
  product_description: "Add product description please",
  selection_title: "Add selection title please",
  offer_description: "Add offer description please",
  offer_product_regular_price: 0,
  product_page_message: __( 'Free Gift', 'storegrowth-sales-booster' ),
  shop_page_message: __( '', 'storegrowth-sales-booster' ),
};
/**
 * Default data of create bogo.
 */
export const iniBogoGlobalSettings = {
  offer_remove_from_cart: false,
  regular_price_show: false,
  shop_page_bage_icon: false,
  global_product_page_bage_icon: false,
  bogo_category_page_message: "",
  default_custom_badge_icon: "",
  default_badge_icon_name: "bogo-icons-1",
  bogo_category_messages: [],
};
