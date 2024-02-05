import { Fragment } from "react";
import { __ } from "@wordpress/i18n";
import { applyFilters } from "@wordpress/hooks";
import SettingsSection from "sales-booster/src/components/settings/Panels/PanelSettings/SettingsSection";
import ColourPicker from "sales-booster/src/components/settings/Panels/PanelSettings/Fields/ColorPicker";
import ActionsHandler from "sales-booster/src/components/settings/Panels/PanelSettings/ActionsHandler";

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
