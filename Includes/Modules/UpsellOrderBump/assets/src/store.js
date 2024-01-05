import { createReduxStore } from '@wordpress/data';
import { createBumpForm } from "./helper";

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

export default createReduxStore( 'sgsb_order_bump', {
  reducer,
  actions,
  selectors
} );
