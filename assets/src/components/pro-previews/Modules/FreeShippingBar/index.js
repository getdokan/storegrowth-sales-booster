import { __ } from "@wordpress/i18n";
import DisplayRules from "./DisplayRules";
import { addFilter } from "@wordpress/hooks";
import RadioBox from "../../../settings/Panels/PanelSettings/Fields/RadioBox";
import InputNumber from "../../../settings/Panels/PanelSettings/Fields/Number";
import SelectBox from "../../../settings/Panels/PanelSettings/Fields/SelectBox";

// Handle Free Shipping Bar Modules pro settings prompts.

addFilter(
  "sgsb_free_shipping_bar_position_settings",
  "sgsb_free_shipping_bar_position_settings_callback",
  (component) => {
    const barPositions = [
      {
        value: "top",
        label: __("Top", "storegrowth-sales-booster"),
      },
    ];
    return (
      <SelectBox
        name={`bar_position`}
        options={[...barPositions]}
        fieldValue={"top"}
        needUpgrade={true}
        title={__("Bar Position", "storegrowth-sales-booster")}
      />
    );
  }
);

addFilter(
  "sgsb_free_shipping_bar_icon_radio_box",
  "sgsb_free_shipping_bar_icon_radio_box_callback",
  (component, iconOptions, formData, onBarChange) => {
    return (
      <RadioBox
        uploadOption={"pro"}
        options={[...iconOptions]}
        name={`progressive_banner_icon_name`}
        changeHandler={onBarChange}
        title={__(`Banner Icon`, "storegrowth-sales-booster")}
        customValue={""}
        fieldValue={formData.progressive_banner_icon_name}
      />
    );
  }
);

addFilter(
  "sgsb_free_shipping_bar_height_settings",
  "sgsb_free_shipping_bar_height_settings_callback",
  (component) => {
    return (
      <InputNumber
        min={1}
        max={100}
        style={{
          width: "100px",
        }}
        name={`banner_height`}
        fieldValue={60}
        needUpgrade={true}
        title={__(`Banner Height`, "storegrowth-sales-booster")}
      />
    );
  }
);
addFilter(
  "sgsb_free_shipping_bar_font_size",
  "sgsb_free_shipping_bar_font_size_callback",
  (component) => {
    return (
      <InputNumber
        min={1}
        max={100}
        style={{
          width: "100px",
        }}
        name={`font_size`}
        fieldValue={20}
        needUpgrade={true}
        title={__(`Font Size`, "storegrowth-sales-booster")}
      />
    );
  }
);

addFilter(
  "sgsb_free_shipping_bar_display_rules_settings",
  "sgsb_free_shipping_bar_display_rules_settings_callback",
  (component) => {
    return <DisplayRules />;
  }
);
