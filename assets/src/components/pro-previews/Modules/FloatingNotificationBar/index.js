import { __ } from "@wordpress/i18n";
import DisplayRules from "./DisplayRules";
import { Checkbox } from "antd";
import {Fragment} from 'react'
import { addFilter } from "@wordpress/hooks";
import RadioBox from "../../../settings/Panels/PanelSettings/Fields/RadioBox";
import InputNumber from "../../../settings/Panels/PanelSettings/Fields/Number";
import SelectBox from "../../../settings/Panels/PanelSettings/Fields/SelectBox";
import UpgradeOverlay from "../../../settings/Panels/PanelSettings/UpgradeOverlay";
import UpgradeCrown from "../../../settings/Panels/PanelSettings/UpgradeCrown";
import Countdown from "./Countdown";
import CuponCode from "./CuponCode";

// Handle Floating Notification Bar Modules pro settings prompts.

addFilter(
  "sgsb_floating_notification_bar_position_settings",
  "sgsb_floating_notification_bar_position_settings_callback",
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
  "sgsb_floating_notification_bar_icon_radio_box",
  "sgsb_floating_notification_bar_icon_radio_box_callback",
  (component, iconOptions, formData, onBarChange) => {
    return (
      <RadioBox
        uploadOption={"pro"}
        options={[...iconOptions]}
        name={`default_banner_icon_name`}
        changeHandler={onBarChange}
        title={__(`Banner Icon`, "storegrowth-sales-booster")}
        customValue={""}
        fieldValue={formData.default_banner_icon_name}
      />
    );
  }
);

addFilter(
  "sgsb_floating_notification_bar_height_settings",
  "sgsb_floating_notification_bar_height_settings_callback",
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
  "sgsb_floating_notification_bar_font_size",
  "sgsb_floating_notification_bar_font_size_callback",
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
  "sgsb_floating_notification_bar_display_rules_settings",
  "sgsb_floating_notification_bar_display_rules_settings_callback",
  (component) => {
    return <DisplayRules />;
  }
);
addFilter(
  "sgsb_floating_notification_bar_button_redirection",
  "sgsb_floating_notification_bar_button_redirection_callback",
  (component) => {
    return (
      <label className={"single-disabled-checkbox"}>
        <Checkbox disabled={true} value={"new_tab_enable"} checked={false}>
          <div style={{ display: "flex", gap: "10px" }}>
            {__("Open in New Tab",'storegrowth-sales-booster')}
            {<UpgradeCrown />}
          </div>
        </Checkbox>
        {<UpgradeOverlay />}
      </label>
    );
  }
);

addFilter(
  "sgsb_floating_notification_bar_coupon_coundown",
  "sgsb_floating_notification_bar_coupon_coundown_callback",
  (component) => {
    return (
      <Fragment>
        <Countdown />
        <CuponCode />
      </Fragment>
    );
  }
);
