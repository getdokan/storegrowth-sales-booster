import { Fragment } from "react";
import { __ } from "@wordpress/i18n";
import { applyFilters } from "@wordpress/hooks";
import SettingsSection from "sales-booster/src/components/settings/Panels/PanelSettings/SettingsSection";
import ColourPicker from "sales-booster/src/components/settings/Panels/PanelSettings/Fields/ColorPicker";
import ActionsHandler from "sales-booster/src/components/settings/Panels/PanelSettings/ActionsHandler";
import Number from "sales-booster/src/components/settings/Panels/PanelSettings/Fields/Number";

function DesignTab(props) {
  const {
    formData,
    onFieldChange,
    onFormSave,
    buttonLoading,
    onFormReset,
  } = props;

  return (
    <Fragment>
      <SettingsSection>
      <Number
          min={1}
          max={100}
          style={{
            width: "100px",
            textAlign: "center",
          }}
          addonAfter={"px"}
          name={"button_border_radius"}
          fieldValue={formData?.button_border_radius}
          changeHandler={onFieldChange}
          title={__("Button Border Radius", "storegrowth-sales-booster")}
          placeHolderText={__("Border Radius", "storegrowth-sales-booster")}
          tooltip={__(
            "To set the border radius of the button",
            "storegrowth-sales-booster"
          )}
        />
        <ColourPicker
          name={"button_color"}
          fieldValue={formData?.button_color}
          changeHandler={onFieldChange}
          title={__("Button Color", "storegrowth-sales-booster")}
        />
        <ColourPicker
          name={"button_text_color"}
          fieldValue={formData?.button_text_color}
          changeHandler={onFieldChange}
          title={__("Button Text Color", "storegrowth-sales-booster")}
        />
        <ColourPicker
          name={"modal_background_color"}
          fieldValue={formData?.modal_background_color}
          changeHandler={onFieldChange}
          title={__("Modal Backgroud Color", "storegrowth-sales-booster")}
        />

        {applyFilters(
          "sgsb_quick_view_navigation_settings",
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

export default DesignTab;
