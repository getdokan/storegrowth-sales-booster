import { createReduxStore } from "@wordpress/data";
import { createBogoForm, iniBogoGlobalSettings } from "./helper";

/**
 * Default state.
 */
const DEFAULT_STATE = {
  createBogoForm,
  bogo_data: [],
  bogoGeneralSettings: iniBogoGlobalSettings,
};

/**
 * Reducer to update the state.
 */
const reducer = (state = DEFAULT_STATE, action) => {
  switch (action.type) {
    case "UPDATE_BUMP_CREATE_FORM":
      return {
        ...state,
        createBogoForm: action.payload,
      };

    case "UPDATE_BUMP_LIST":
      return {
        ...state,
        bogo_data: action.payload,
      };

    case "UPDATE_BOGO_GLOBAL_SETTINGS":
      return {
        ...state,
        bogoGeneralSettings: action.payload,
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
      type: "UPDATE_BUMP_CREATE_FORM",
      payload,
    };
  },

  resetCreateFromData() {
    return {
      type: "UPDATE_BUMP_CREATE_FORM",
      payload: createBogoForm,
    };
  },

  setBogoData(payload) {
    return {
      type: "UPDATE_BUMP_LIST",
      payload,
    };
  },

  resetBogoData() {
    return {
      type: "UPDATE_BUMP_LIST",
      payload: [],
    };
  },
  setBogoGlobalSettings(payload) {
    return {
      type: "UPDATE_BOGO_GLOBAL_SETTINGS",
      payload,
    };
  },

  resetBogoGlobalSettings() {
    return {
      type: "UPDATE_BOGO_GLOBAL_SETTINGS",
      payload: iniBogoGlobalSettings, // Reset to initial bogoGlobalSettings
    };
  },
};

/**
 * Selectors to retrieve data from state.
 */
const selectors = {
  getCreateFromData(state) {
    return state.createBogoForm;
  },
  getBogoData(state) {
    return state.bogo_data;
  },
  getBogoGlobalSettings(state) {
    return state.bogoGeneralSettings;
  },
};

export default createReduxStore("sgsb_bogo", {
  reducer,
  actions,
  selectors,
});
