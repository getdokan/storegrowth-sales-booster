import { createReduxStore } from '@wordpress/data';

/**
 * Default state.
 */
const DEFAULT_STATE = {
  pageLoading: false,
};

/**
 * Reducer to update the state.
 */
const reducer = (state = DEFAULT_STATE, action) => {
  switch ( action.type ) {
    case 'SET_PAGE_LOADING':
      return {
        ...state,
        pageLoading: action.loading,
      };

    default:
      return state;
  }
};

/**
 * Actions to call the reducer.
 */
const actions = {
  setPageLoading(loading) {
    return {
      type: 'SET_PAGE_LOADING',
      loading,
    };
  }
};

/**
 * Selectors to retrieve data from state.
 */
const selectors = {
  getPageLoading(state) {
    return state.pageLoading;
  }
};

const store = createReduxStore( 'sgsb', {
  reducer,
  actions,
  selectors
});

export default store;
