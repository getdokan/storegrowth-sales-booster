import { createReduxStore } from '@wordpress/data';
import { createPopupForm } from "./helper";

/**
 * Default state.
 */
const DEFAULT_STATE = {
	createPopupForm,
	buttonLoading: false
};

/**
 * Reducer to update the state.
 */
 const reducer = (state = DEFAULT_STATE, action) => {
	switch ( action.type ) {
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
	}
};

export default createReduxStore( 'sgsb_order_sales_pop', {
	reducer,
	actions,
	selectors
} );
