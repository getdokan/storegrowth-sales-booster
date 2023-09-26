import { Fragment } from "react";
import { __ } from "@wordpress/i18n";
import SettingsSection from "sales-booster/src/components/settings/Panels/PanelSettings/SettingsSection";
import ColourPicker from "sales-booster/src/components/settings/Panels/PanelSettings/Fields/ColorPicker";
import Number from "sales-booster/src/components/settings/Panels/PanelSettings/Fields/Number";
import SelectBox from "sales-booster/src/components/settings/Panels/PanelSettings/Fields/SelectBox";
import TextInput from "sales-booster/src/components/settings/Panels/PanelSettings/Fields/TextInput";
import ActionsHandler from "sales-booster/src/components/settings/Panels/PanelSettings/ActionsHandler";

function DesignTab(props) {
  const {
    formData,
    onFieldChange,
    onFormSave,
    buttonLoading,
    upgradeTeaser,
    onFormReset,
    noop,
  } = props;

  const barDisplayFormat = [
    {
      value: "above",
      label: __("Above Stock Bar", "storegrowth-sales-booster"),
    },
    {
      value: "below",
      label: __("Above Stock Bar", "storegrowth-sales-booster"),
    },
  ];

  return (
    <Fragment>
      <SettingsSection>
        <ColourPicker
          name={"stockbar_bg_color"}
          fieldValue={formData.stockbar_bg_color}
          changeHandler={onFieldChange}
          title={__("Background Color", "storegrowth-sales-booster")}
        />
        <ColourPicker
          needUpgrade={upgradeTeaser}
          name={"stockbar_fg_color"}
          fieldValue={formData.stockbar_fg_color}
          changeHandler={upgradeTeaser ? noop : onFieldChange}
          title={__("Foreground Color", "storegrowth-sales-booster")}
        />
        <ColourPicker
          name={"stockbar_border_color"}
          fieldValue={formData.stockbar_border_color}
          changeHandler={onFieldChange}
          title={__("Border Color", "storegrowth-sales-booster")}
        />

        <Number
          min={1}
          max={100}
          style={{
            width: "100px",
          }}
          name={`stockbar_height`}
          changeHandler={upgradeTeaser ? noop : onFieldChange}
          fieldValue={formData.stockbar_height}
          needUpgrade={upgradeTeaser}
          title={__(`Stock Bar Height`, "storegrowth-sales-booster")}
        />

        <SelectBox
          needUpgrade={upgradeTeaser}
          name={`stock_display_format`}
          options={[...barDisplayFormat]}
          fieldValue={formData.stock_display_format}
          changeHandler={upgradeTeaser ? noop : onFieldChange}
          title={__("Stock Display Format", "storegrowth-sales-booster")}
          tooltip={__(
            "Select your desired font family",
            "storegrowth-sales-booster"
          )}
        />

        <TextInput
          name={"total_sell_count_text"}
          placeHolderText={__(
            "Last chance! [discount]% OFF",
            "storegrowth-sales-booster"
          )}
          fieldValue={formData.total_sell_count_text}
          className={`settings-field input-field`}
          changeHandler={upgradeTeaser ? noop : onFieldChange}
          title={__("Total Sell Count Text", "storegrowth-sales-booster")}
          tooltip={__(
            "It will be placed left side of the above of the Stock Bar. e.g. Total Sold",
            "storegrowth-sales-booster"
          )}
          needUpgrade={upgradeTeaser}
        />
        <TextInput
          name={"available_item_count_text"}
          placeHolderText={__(
            "Last chance! [discount]% OFF",
            "storegrowth-sales-booster"
          )}
          fieldValue={formData.available_item_count_text}
          className={`settings-field input-field`}
          changeHandler={upgradeTeaser ? noop : onFieldChange}
          title={__("Available Item Count Text", "storegrowth-sales-booster")}
          tooltip={__(
            "It will be placed right side of the above of the Stock Bar. e.g. Available Item",
            "storegrowth-sales-booster"
          )}
          needUpgrade={upgradeTeaser}
        />
        <ActionsHandler
          resetHandler={onFormReset}
          loadingHandler={buttonLoading}
          saveHandler={onFormSave}
        />
      </SettingsSection>
    </Fragment>
  );
}

export default DesignTab;
