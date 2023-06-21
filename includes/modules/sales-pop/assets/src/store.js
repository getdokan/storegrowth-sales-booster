import { createReduxStore,  subscribe, select, dispatch } from '@wordpress/data';
import { getAllStatesWithoutCity } from './helper';

/**
 * Default state of create popup.
 */
 const message = {


	message_popup           : `Purchased {product_title}
by {virtual_name}
from {location}
TIME verfied by wpCodal `,
	message_checkout        : 'Test Checkout Message',
	normal_text_color       : '#000000',
	product_title_color     : '#000000',
	product_link_color      : '#000000',
	time_text_color         : '#000000',
	date_text_color         : '#000000',
	country_text_color      : '#000000',
	state_text_color        : '#000000',
	city_text_color         : '#000000',
	name_text_color         : '#000000',

	normal_text_font_size   : '16',
	product_title_font_size : '16',
	product_link_font_size  : '16',
	time_text_font_size     : '16',
	date_text_font_size     : '16',
	country_text_font_size  : '16',
	state_text_font_size    : '16',
	city_text_font_size     : '16',
	name_text_font_size     : '16',

	normal_text_font_weight   : 'normal',
	product_title_font_weight : 'normal',
	product_link_font_weight  : 'normal',
	time_text_font_weight     : 'normal',
	date_text_font_weight     : 'normal',
	country_text_font_weight  : 'normal',
	state_text_font_weight    : 'normal',
	city_text_font_weight     : 'normal',
	name_text_font_weight     : 'normal',
 }
 const createPopupForm = {
	...message,
	popup_products               : [],
	enabe                        : false,
	mobile_view                  : false,
	highlight_color              : '#000000',
	text_color                   : '#000000',
	background_color             : '#ECF0F1',
	image_position               : 'left',
	popup_position               : 'left_bottom',
	popup_width                  : 30,
	popup_image_width            : 20,
	popup_mobile_image_width     : 25,
	popup_border_radius          : 5,
	popup_image_border_radius    : 0,
	spacing_around_image         : 10,
	link_image_to_product        : false,
	open_product_link_in_new_tab : false,
	show_close_button            : false,
	external_link                : false,
	product_random               : false,
	virtual_name                 : [],
	virtual_time				 : 1,
	address                      : ['real'],
	virtual_country              : ['bangladesh'],
	product_image_size           : '300*300',
	loop                         : false,
	next_time_display            : 60,
	notification_per_page        : 30,
	initial_time_delay           : 5,
	dispaly_time                 : 5,
	sound                        : false,
	sound_type                   : 'sound_a',
	countries                    : [],
	virtual_countries            : [],
	state_by_country             : [],
	virtual_state                : [],
	city_by_state                : [],
	virtual_city                 : [],
	screen_width                 : window.screen.width,
	screen_height                : window.screen.height,
};

const salesPopFlags = {
    isStatesWithoutCitiesInDb: false,
    isSettingStatesWithoutCitiesInDb: false,
    isFetchedInitialFlags: false,
    isFetchingInitialFlags: false,
}
/**
 * Default state.
 */
const DEFAULT_STATE = {
	createPopupForm,
	buttonLoading: false,
    salesPopFlags,
};

/**
 * Reducer to update the state.
 */
 const reducer = (state = DEFAULT_STATE, action) => {
	switch ( action.type ) {
		case 'UPDATE_SALES_POP_FLAGS':
            return {
                ...state,
                salesPopFlags:{
                    ...state.salesPopFlags,
                    ...action.payload,
                }
            }

        case 'UPDATE_POPUP_CREATE_FORM':
			return {
				...state,
				createPopupForm: action.payload,
			};

		case 'UPDATE_BUTTON_LOADING':
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
	setSalesPopFlags(payload) {
		return {
			type: 'UPDATE_SALES_POP_FLAGS',
			payload,
		};
	},

    setCreateFromData(payload) {
		return {
			type: 'UPDATE_POPUP_CREATE_FORM',
			payload,
		};
	},

	setButtonLoading(payload) {
		return {
			type: 'UPDATE_BUTTON_LOADING',
			payload,
		};
	},
};

/**
 * Selectors to retrieve data from state.
 */
const selectors = {
	getCreateFromData(state) {
		return state.createPopupForm;
	},

	getButtonLoading(state) {
		return state.buttonLoading;
	},

	getSalesPopFlags(state) {
		return state.salesPopFlags;
	}
};

export default createReduxStore( 'sgsb_order_sales_pop', {
	reducer,
	actions,
	selectors
} );

subscribe(() => {
    const {
        isStatesWithoutCitiesInDb,
        isFetchedInitialFlags,
        isFetchingInitialFlags,
        isSettingStatesWithoutCitiesInDb
    } = select('sgsb_order_sales_pop').getSalesPopFlags();

    if(!isFetchedInitialFlags && !isFetchingInitialFlags){
        dispatch('sgsb_order_sales_pop').setSalesPopFlags({isFetchingInitialFlags: true})
        jQuery.post( sales_pop_data.ajax_url, { 
            'action'    : 'fetch_popup_flags', 
		    'data'      : [] ,
			'_ajax_nonce' : sales_pop_data.ajd_nonce
		}, function (response) {
            const data = response.data || {};
            dispatch('sgsb_order_sales_pop').setSalesPopFlags({
                isFetchingInitialFlags: false,
                isFetchedInitialFlags:true,
                ...data,
            })
		});
    }

    if(isFetchedInitialFlags && !isSettingStatesWithoutCitiesInDb && !isStatesWithoutCitiesInDb){
        dispatch('sgsb_order_sales_pop').setSalesPopFlags({isSettingStatesWithoutCitiesInDb:true})
        const states_without_city = getAllStatesWithoutCity();
        jQuery.post( sales_pop_data.ajax_url, {
            'action'    : 'set_states_without_cities_data',
		    'data'      : JSON.stringify({ states_without_city }),
			'_ajax_nonce' : sales_pop_data.ajd_nonce
		}, function (response) {
            const flags = response?.data?.flags || {};
            dispatch('sgsb_order_sales_pop').setSalesPopFlags({
                isSettingStatesWithoutCitiesInDb:false,
                ...flags
            })
		});
    }
})
