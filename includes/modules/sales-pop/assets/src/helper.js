import { State, City } from "country-state-city";
export const getAllStatesWithoutCity = () => {
  const allState = State.getAllStates();
  const StateWithoutCity = [];
  for (const item of allState) {
    if (City.getCitiesOfState(item.countryCode, item.isoCode).length == 0) {
      StateWithoutCity.push(item.countryCode + "#" + item.isoCode);
    }
  }
  return StateWithoutCity;
};
