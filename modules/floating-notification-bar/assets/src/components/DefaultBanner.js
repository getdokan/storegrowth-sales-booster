import { applyFilters } from "@wordpress/hooks";
import { Fragment } from "react";
import { __ } from "@wordpress/i18n";
import TextAreaBox from "../../../../../../assets/src/components/settings/Panels/PanelSettings/Fields/TextAreaBox";
import CheckboxGroup from "../../../../../../assets/src/components/settings/Panels/PanelSettings/Fields/CheckboxGroup";
import SelectBox from "../../../../../../assets/src/components/settings/Panels/PanelSettings/Fields/SelectBox";
import TextInput from "../../../../../../assets/src/components/settings/Panels/PanelSettings/Fields/TextInput";
import SettingsSection from "sales-booster/src/components/settings/Panels/PanelSettings/SettingsSection";
import BarIcon from "./BarIcon";
import ButtonAction from "./ButtonAction";

function DefaultBanner(props) {
  const { formData, setFormData, onFieldChange } = props;

  const checkboxesOption = [
    {
      label: __("Desktop", "storegrowth-sales-booster"),
      value: "button-desktop-enable",
      tooltip: __("", "storegrowth-sales-booster"),
    },
    {
      label: __("Mobile", "storegrowth-sales-booster"),
      value: "button-mobile-enable",
      tooltip: __("", "storegrowth-sales-booster"),
    },
  ];

  const barTypes = [
    {
      value: "normal",
      label: __("Normal", "storegrowth-sales-booster"),
    },
    {
      value: "sticky",
      label: __("Sticky", "storegrowth-sales-booster"),
    },
  ];

  const iconStyleNames = [
    "notify-bar-icon-1",
    "notify-bar-icon-2",
    "notify-bar-icon-3",
  ];

  const iconOptions = iconStyleNames?.map((iconStyleName) => ({
    key: iconStyleName,
    value: (
      <BarIcon
        activeIcon={formData?.default_banner_icon_name === iconStyleName}
        iconName={iconStyleName}
      />
    ),
  }));

  const onBarChange = (key, value) => {
    setFormData({
      ...formData,
      [key]: value,
      default_banner_custom_icon: "",
    });
  };

  return (
    <Fragment>
      <SettingsSection>
        {applyFilters(
          "sgsb_floating_notification_bar_position_settings",
          "",
          formData,
          onFieldChange
        )}

        <SelectBox
          name={`bar_type`}
          options={[...barTypes]}
          fieldValue={formData.bar_type}
          changeHandler={onFieldChange}
          title={__("Bar Type", "storegrowth-sales-booster")}
        />
        <TextAreaBox
          areaRows={3}
          colSpan={24}
          name={"default_banner_text"}
          fieldValue={formData.default_banner_text}
          changeHandler={onFieldChange}
          title={__("Default Banner Text", "storegrowth-sales-booster")}
          placeHolderText={__(
            `Shop more than ${sgsbAdmin.currencySymbol}100 to get free shipping.`,
            "storegrowth-sales-booster"
          )}
        />
        {applyFilters(
          "sgsb_floating_notification_bar_icon_radio_box",
          "",
          iconOptions,
          formData,
          onBarChange,
          setFormData
        )}
        <CheckboxGroup
          displayDirection={"horizontal"}
          name={"button_view"}
          options={checkboxesOption}
          selectedOptions={formData.button_view}
          handleCheckboxChange={onFieldChange}
          title={__("Show Button", "storegrowth-sales-booster")}
          headColSpan={14}
          checkboxColSpan={10}
        />
        <TextInput
          name={"ac_button_text"}
          placeHolderText={__("Button Text Here", "storegrowth-sales-booster")}
          fieldValue={formData.ac_button_text}
          className={`settings-field input-field`}
          changeHandler={onFieldChange}
          title={__("Button Text", "storegrowth-sales-booster")}
        />
        <ButtonAction formData={formData} onFieldChange={onFieldChange} />
        {applyFilters(
          "sgsb_floating_notification_bar_coupon_coundown",
          "",
          formData,
          onFieldChange
        )}
      </SettingsSection>
      {applyFilters(
        "sgsb_floating_notification_bar_display_rules_settings",
        "",
        formData,
        onFieldChange
      )}
    </Fragment>
  );
}

export default DefaultBanner;
