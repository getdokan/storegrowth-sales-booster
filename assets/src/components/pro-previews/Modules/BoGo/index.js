import { __ } from "@wordpress/i18n";
import { addFilter } from "@wordpress/hooks";
import RadioBox from "../../../settings/Panels/PanelSettings/Fields/RadioBox";
import {Fragment} from "react";
import {InputNumber, MultiSelectBox} from "../../../settings/Panels";
import DateField from "../../../settings/Panels/PanelSettings/Fields/DateField";

addFilter(
  'sgsb_bogo_global_badge_icon_radio_box',
  'sgsb_bogo_global_badge_icon_radio_box_callback',
  ( component, iconOptions, currentSettings, onBarChange ) => {
    return (
      <RadioBox
        colSpan={ 12 }
        customValue={''}
        uploadOption={ 'pro' }
        changeHandler={ onBarChange }
        options={ [ ...iconOptions ] }
        name={ `default_badge_icon_name` }
        fieldValue={ currentSettings?.default_badge_icon_name }
        title={ __(`Badge Icon`, 'storegrowth-sales-booster' ) }
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

addFilter(
  "sgsb_after_bogo_offer_settings",
  "sgsb_bogo_after_offer_settings_callback",
  () => {
    return (
      <InputNumber
        min={1}
        fieldValue={ 1 }
        needUpgrade={ true }
        name={"minimum_quantity_required"}
        title={__("Select Min Quantity", "storegrowth-sales-booster")}
        tooltip={__("Minimum add to cart", "storegrowth-sales-booster")}
      />
    );
  }
);

addFilter(
  "sgsb_after_bogo_basic_info_settings",
  "sgsb_after_bogo_basic_info_settings_callback",
  () => {
    const bogoSchedules = [
      { value: "daily", label: __("Daily", "storegrowth-sales-booster") },
    ];

    return (
      <Fragment>
        <MultiSelectBox
          needUpgrade={true}
          name={"exclude_products"}
          title={__("Exclude Products", "storegrowth-sales-booster")}
          placeHolderText={__("Select exclude products", "storegrowth-sales-booster")}
          tooltip={__(
            "Exclude this category products as alternate product for this offer.",
            "storegrowth-sales-booster"
          )}
        />
        <MultiSelectBox
          needUpgrade={true}
          name={"offer_schedule"}
          options={bogoSchedules}
          fieldValue={['daily']}
          title={__("BOGO Schedule", "storegrowth-sales-booster")}
          placeHolderText={__(
            "Please select bogo schedule",
            "storegrowth-sales-booster"
          )}
          tooltip={__(
            "The schedule can be daily or on specific days of the week.",
            "storegrowth-sales-booster"
          )}
        />
        <DateField
          needUpgrade={true}
          name={"offer_start"}
          title={__("Offer Start", "storegrowth-sales-booster")}
          tooltip={__("Offer Start", "storegrowth-sales-booster")}
          fullWidth={true}
        />
        <DateField
          needUpgrade={true}
          name={"offer_end"}
          title={__("Offer End", "storegrowth-sales-booster")}
          tooltip={__("Offer End", "storegrowth-sales-booster")}
          endDateDisable={true}
          fullWidth={true}
        />
      </Fragment>
    );
  }
);
