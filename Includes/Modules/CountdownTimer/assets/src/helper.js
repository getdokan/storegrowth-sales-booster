import { __ } from '@wordpress/i18n';

export const isString = (value) => typeof value === "string";

export const countdownPropertiesToWorkForHtmlEntity = [
  "name_of_countdown",
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

export const convertBogoItemTextDatasToHtmlEntities = (countdownItem) => {
  const newCountdownData = {
    ...countdownItem,
  };

  for (const property of countdownPropertiesToWorkForHtmlEntity) {
    if (newCountdownData.hasOwnProperty(property)) {
      newCountdownData[property] = convertToHTMLEntities(newCountdownData[property]);
    }
  }

  return newCountdownData;
};

export const convertBogoItemHtmlEntitiesToTexts = (countdownItem) => {
  const newCountdownData = {
    ...countdownItem,
  };

  for (const property of countdownPropertiesToWorkForHtmlEntity) {
    if (newCountdownData.hasOwnProperty(property)) {
      newCountdownData[property] = convertFromHTMLEntities(newCountdownData[property]);
    }
  }

  return newCountdownData;
};

/**
 * Default data of create countdown.
 */
export const createCountdownForm = {
  name_of_countdown: "",
  countdown_type: "products",
  countdown_status: "yes",
  countdown_start_date: "",
  countdown_end_date: "",
  offer_type: [],
  discount_amount: "",
  discount_on:"sale_price",
  target_products: '',
  target_categories: [],
  enable_discount_section:false,
  font_family: "roboto",
  border_color: "#1677FF",
  day_text_color: "#1B1B50",
  selected_theme: "ct-layout-1",
  hour_text_color: "#1B1B50",
  minute_text_color: "#1B1B50",
  second_text_color: "#1B1B50",
  countdown_heading: "[discount]% OFF",
  heading_text_color: "#008DFF",
  counter_border_color: "#ECEDF0",
  widget_background_color: "#FFFFFF",
  counter_background_color: "#FFFFFF",
  shop_page_countdown_enable: false,
  product_page_countdown_enable: true,
  enable_ct_block: false,
};
/**
 * Default data of create bogo.
 */
export const iniShortCodeState = {
  offer_remove_from_cart: false,
  regular_price_show: false,
  shop_page_bage_icon: false,
  global_product_page_bage_icon: false,
  bogo_category_page_message: "",
  default_custom_badge_icon: "",
  default_badge_icon_name: "bogo-icons-1",
  bogo_category_messages: [],
};
