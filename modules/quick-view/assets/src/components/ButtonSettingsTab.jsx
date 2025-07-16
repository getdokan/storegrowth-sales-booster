import { Fragment } from "react";
import { __ } from "@wordpress/i18n";
import { applyFilters } from "@wordpress/hooks";
import SettingsSection from "sales-booster/src/components/settings/Panels/PanelSettings/SettingsSection";
import ActionsHandler from "sales-booster/src/components/settings/Panels/PanelSettings/ActionsHandler";
import TextInput from "sales-booster/src/components/settings/Panels/PanelSettings/Fields/TextInput";
import QuickViewIcon from "./QuickViewIcon";
import { Switcher, SelectBox, RadioBox } from "sales-booster/src/components/settings/Panels";

function ButtonSettingsTab(props) {
  const {
    formData,
    onFieldChange,
    onFormSave,
    buttonLoading,
    onFormReset,
  } = props;

  let buttonPositions = [
    {
      value: "after_add_to_cart",
      label: __("After Add to Cart", "storegrowth-sales-booster"),
    },
    {
      value: "before_add_to_cart",
      label: __("Before Add to Cart", "storegrowth-sales-booster"),
    }
  ];

  buttonPositions = applyFilters(
    "sgsb_quick_view_button_position_settings",
    "",
    buttonPositions
  )

  const iconStyleNames = [
    'quick-view-icon-1',
    'quick-view-icon-2',
    'quick-view-icon-3',
    'quick-view-icon-4',
  ];

  const iconOptions = iconStyleNames?.map(iconStyleName => (
    { key: iconStyleName, value: <QuickViewIcon activeIcon={formData?.quick_view_icon === iconStyleName} iconName={iconStyleName} /> }
  ));

  return (
    <Fragment>
      <SettingsSection>
        <TextInput
          name={"button_label"}
          className={`settings-field input-field`}
          fieldValue={formData?.button_label}
          changeHandler={onFieldChange}
          title={__("Quick View Button label", "storegrowth-sales-booster")}
          placeHolderText={__(
            "Quick View Button Label",
            "storegrowth-sales-booster"
          )}
          tooltip={__(
            "This will be the set the Label of the Quick View Button",
            "storegrowth-sales-booster"
          )}
        />
        <SelectBox
          name={`button_position`}
          options={[...buttonPositions]}
          fieldValue={formData?.button_position}
          changeHandler={onFieldChange}
          title={__("Button Position", "storegrowth-sales-booster")}
        />
        {applyFilters(
          "sgsb_quick_view_button_icon_settings",
          "",
          onFieldChange,
          formData,
          iconOptions
        )}

        <Switcher
          colSpan={24}
          name={"enable_close_button"}
          changeHandler={onFieldChange}
          title={__("Enable Close Button", "storegrowth-sales-booster")}
          isEnable={
            formData?.enable_close_button == "true" ||
              formData?.enable_close_button == true
              ? true
              : false
          }
          tooltip={__(
            "By enableing this quick view will show in mobile.",
            "storegrowth-sales-booster"
          )}
        />
        {applyFilters(
          "sgsb_quick_after_modal_close_button_settings",
          "",
          formData,
          onFieldChange
        )}
      </SettingsSection>
      <ActionsHandler
        resetHandler={onFormReset}
        loadingHandler={buttonLoading}
        saveHandler={onFormSave}
      />
    </Fragment>
  );
}

export default ButtonSettingsTab;
