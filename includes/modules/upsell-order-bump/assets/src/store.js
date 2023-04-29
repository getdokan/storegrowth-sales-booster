import { createReduxStore } from '@wordpress/data';

/**
 * Default state of create bump.
 */
const createBumpForm = {
  name_of_order_bump: '',
  target_products: [],
  target_categories: [],
  bump_schedule: ['daily'],
  smart_offer: false,
  offer_product: '',
  offer_type: [],
  offer_amount: '',
  box_border_style: 'solid',
  box_border_color: '#8fa68bff',
  box_top_margin: 0,
  box_bottom_margin: 0,
  discount_background_color: '#000000',
  discount_text_color:'#ffffff',
  discount_font_size: '16',
  product_description_text_color: '#000000',
  product_description_font_size: '14',
  accept_offer_background_color: '#e08b22ff',
  accept_offer_text_color: '#000000',
  accept_offer_font_size: '14',
  offer_description_background_color:'#8fa68bff',
  offer_description_text_color:'#000000',
  offer_description_font_size: '14',
  offer_image_url: bump_save_url.image_folder+'/icon.png',
  offer_product_title:"Please select your offer product",
  offer_product_id: 0,
  offer_discount_title:'Add your discount title please',
  offer_fixed_price_title:'Add fixed price title please',
  product_description:'Add product description please',
  selection_title:'Add selection title please',
  offer_description:'Add offer description please',
  offer_product_regular_price : 0
};


/**
 * Default state.
 */
const DEFAULT_STATE = {
  createBumpForm,
  bump_data:[]
};

/**
 * Reducer to update the state.
 */
 const reducer = (state = DEFAULT_STATE, action) => {
  switch ( action.type ) {
    case 'UPDATE_BUMP_CREATE_FORM':
      return {
        ...state,
        createBumpForm: action.payload,
      };

    case 'UPDATE_BUMP_LIST':
      return {
        ...state,
        bump_data: action.payload,
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
      type: 'UPDATE_BUMP_CREATE_FORM',
      payload,
    };
  },

  resetCreateFromData() {
    return {
      type: 'UPDATE_BUMP_CREATE_FORM',
      payload: createBumpForm,
    };
  },

  setBumpData(payload) {
    return {
      type: 'UPDATE_BUMP_LIST',
      payload,
    };
  },

  resetBumpData() {
    return {
      type: 'UPDATE_BUMP_LIST',
      payload: [],
    };
  }

};

/**
 * Selectors to retrieve data from state.
 */
const selectors = {
  getCreateFromData(state) {
    return state.createBumpForm;
  },
  getBumpData(state) {
    return state.bump_data;
  }
};

export default createReduxStore( 'sbfw_order_bump', {
  reducer,
  actions,
  selectors
} );
