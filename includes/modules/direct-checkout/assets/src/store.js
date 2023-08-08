import { createReduxStore } from "@wordpress/data";

/**
 * Default state of direct checkout.
 */

const createDirectCheckoutForm = {
  buy_now_button_setting: "cart-with-buy-now",
  buy_now_button_label: "Buy Now",
  checkout_redirect: "legacy-checkout",
  shop_page_checkout_enable: true,
  product_page_checkout_enable: true,
  button_color: "#008dff",
  text_color: "#ffffff",
  font_size: "16",
  button_border_radius: "5",
	generated_link:"example",
};

/**
 * Default state.
 */
const DEFAULT_STATE = {
  createDirectCheckoutForm,
  buttonLoading: false,
};

/**
 * Reducer to update the state.
 */
const reducer = (state = DEFAULT_STATE, action) => {
  switch (action.type) {
    case "UPDATE_DIRECT_CHECKOUT_FORM":
      return {
        ...state,
        createDirectCheckoutForm: action.payload,
      };

    case "UPDATE_BUTTON_LOADING":
      return {
        ...state,
        buttonLoading: action.payload,
      };

    default:
      return state;
  }
};

/**
 * Actions to call the reducer.
 */
const actions = {
  setCreateFromData(payload) {
    return {
      type: "UPDATE_DIRECT_CHECKOUT_FORM",
      payload,
    };
  },

  setButtonLoading(payload) {
    return {
      type: "UPDATE_BUTTON_LOADING",
      payload,
    };
  },
};

/**
 * Selectors to retrieve data from state.
 */
const selectors = {
  getCreateFromData(state) {
    return state.createDirectCheckoutForm;
  },

  getButtonLoading(state) {
    return state.buttonLoading;
  },
};

export default createReduxStore("sgsb_direct_checkout", {
  reducer,
  actions,
  selectors,
});