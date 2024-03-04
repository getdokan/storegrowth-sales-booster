import { createReduxStore } from "@wordpress/data";
import { createCountdownForm, iniShortCodeState } from "./helper";

/**
 * Default state.
 */
const DEFAULT_STATE = {
  createCountdownForm,
  countdown_timer_data: [],
  countdownGeneralSettings: iniShortCodeState,
};

/**
 * Reducer to update the state.
 */
const reducer = (state = DEFAULT_STATE, action) => {
  switch (action.type) {
    case "UPDATE_COUNTDOWN_CREATE_FORM":
      return {
        ...state,
        createBogoForm: action.payload,
      };

    case "UPDATE_COUNTDOWN_LIST":
      return {
        ...state,
        countdown_timer_data: action.payload,
      };

    case "UPDATE_COUNTDOWN_GLOBAL_SETTINGS":
      return {
        ...state,
        countdownGeneralSettings: action.payload,
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
      type: "UPDATE_COUNTDOWN_CREATE_FORM",
      payload,
    };
  },

  resetCreateFromData() {
    return {
      type: "UPDATE_COUNTDOWN_CREATE_FORM",
      payload: createBogoForm,
    };
  },

  setCountdownData(payload) {
    return {
      type: "UPDATE_COUNTDOWN_LIST",
      payload,
    };
  },

  resetCountdownData() {
    return {
      type: "UPDATE_COUNTDOWN_LIST",
      payload: [],
    };
  },
  setCountdownGlobalSettings(payload) {
    return {
      type: "UPDATE_COUNTDOWN_GLOBAL_SETTINGS",
      payload,
    };
  },

  resetCountdownGlobalSettings() {
    return {
      type: "UPDATE_COUNTDOWN_GLOBAL_SETTINGS",
      payload: iniShortCodeState, // Reset to initial bogoGlobalSettings
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
  getCountdownData(state) {
    return state.countdown_timer_data;
  },
  getCountdownGlobalSettings(state) {
    return state.countdownGeneralSettings;
  },
};

export default createReduxStore("sgsb_countdown_timer", {
  reducer,
  actions,
  selectors,
});
