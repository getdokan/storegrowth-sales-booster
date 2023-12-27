import { __ } from "@wordpress/i18n";
import { addFilter } from "@wordpress/hooks";
import RadioBox from "../../../settings/Panels/PanelSettings/Fields/RadioBox";

addFilter(
  "sgsb_bogo_global_badge_icon_radio_box",
  "sgsb_bogo_global_badge_icon_radio_box_callback",
  (component, iconOptions, currentSettings, onBarChange) => {
    return (
      <RadioBox
        uploadOption={"pro"}
        options={[...iconOptions]}
        name={`default_badge_icon_name`}
        changeHandler={onBarChange}
        title={__(`Badge Icon`, "storegrowth-sales-booster")}
        customValue={""}
        fieldValue={currentSettings?.default_badge_icon_name}
      />
    );
  }
);

addFilter(
  "sgsb_bogo_single_badge_icon_radio_box",
  "sgsb_bogo_single_badge_icon_radio_box_callback",
  (component, iconOptions, createBogoData, onBarChange) => {
    return (
      <RadioBox
        uploadOption={"pro"}
        options={[...iconOptions]}
        name={`default_badge_icon_name`}
        changeHandler={onBarChange}
        title={__(`Badge Icon`, "storegrowth-sales-booster")}
        customValue={""}
        fieldValue={createBogoData?.default_badge_icon_name}
      />
    );
  }
);
