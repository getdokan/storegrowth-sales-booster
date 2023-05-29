import { createReduxStore } from '@wordpress/data';

/**
 * Default state.
 */
const DEFAULT_STATE = {
  modules: [],
  pageLoading: false,
};

/**
 * Reducer to update the state.
 */
const reducer = (state = DEFAULT_STATE, action) => {
  switch ( action.type ) {
    case 'UPDATE_MODULES':
      return {
        ...state,
        modules: action.modules,
      };

    case 'UPDATE_SINGLE_MODULE':
      let modules = state.modules.map((module) => {
        if ( module.id === action.moduleId ) {
          module.status = action.status
        }

        return module;
      });

      return {
        ...state,
        modules,
      };

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
  updateModules(modules) {
    return {
      type: 'UPDATE_MODULES',
      modules,
    };
  },

  updateSingleModule(moduleId, status) {
    return {
      type: 'UPDATE_SINGLE_MODULE',
      moduleId,
      status
    };
  },

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
  getModules(state) {
    return state.modules;
  },

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
