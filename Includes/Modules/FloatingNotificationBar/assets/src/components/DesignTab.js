import { Fragment } from "react";
import { __ } from "@wordpress/i18n";
import { applyFilters } from "@wordpress/hooks";
import ActionsHandler from "sales-booster/src/components/settings/Panels/PanelSettings/ActionsHandler";
import SettingsSection from "../../../../../../assets/src/components/settings/Panels/PanelSettings/SettingsSection";
import ColourPicker from "../../../../../../assets/src/components/settings/Panels/PanelSettings/Fields/ColorPicker";
import SelectBox from "../../../../../../assets/src/components/settings/Panels/PanelSettings/Fields/SelectBox";
import Templates from "./Templates";

function DesignTab(props) {
  const {
    formData,
    setFormData,
    onFieldChange,
    onFormSave,
    buttonLoading,
    onFormReset,
    fontFamily,
  } = props;

  return (
    <Fragment>
      <SettingsSection>
        {applyFilters(
          "sgsb_floating_notification_bar_height_settings",
          "",
          formData,
          onFieldChange
        )}
        <SelectBox
          name={`font_family`}
          options={[...fontFamily]}
          fieldValue={formData.font_family}
          changeHandler={onFieldChange}
          title={__("Font Family", "storegrowth-sales-booster")}
          tooltip={__(
            "Select your desired font family",
            "storegrowth-sales-booster"
          )}
        />
        {applyFilters(
          "sgsb_floating_notification_bar_font_size",
          "",
          formData,
          onFieldChange
        )}
        <ColourPicker
          name={"background_color"}
          colSpan={12}
          fieldValue={formData.background_color}
          changeHandler={onFieldChange}
          title={__("Background Color", "storegrowth-sales-booster")}
        />
        <ColourPicker
          name={"text_color"}
          colSpan={12}
          fieldValue={formData.text_color}
          changeHandler={onFieldChange}
          title={__("Text Color", "storegrowth-sales-booster")}
        />
        <ColourPicker
          name={"icon_color"}
          colSpan={12}
          fieldValue={formData.icon_color}
          changeHandler={onFieldChange}
          title={__("Icon Color", "storegrowth-sales-booster")}
        />
        <ColourPicker
          name={"button_color"}
          colSpan={12}
          fieldValue={formData.button_color}
          changeHandler={onFieldChange}
          title={__("Button Color", "storegrowth-sales-booster")}
        />
        <ColourPicker
          name={"button_text_color"}
          colSpan={12}
          fieldValue={formData.button_text_color}
          changeHandler={onFieldChange}
          title={__("Button Text Color", "storegrowth-sales-booster")}
        />
        <ColourPicker
          colSpan={12}
          name={"close_icon_color"}
          changeHandler={onFieldChange}
          fieldValue={formData.close_icon_color}
          title={__("Close Icon Color", "storegrowth-sales-booster")}
        />
      </SettingsSection>

      <Templates formData={formData} setFormData={setFormData} />

      <ActionsHandler
        resetHandler={onFormReset}
        loadingHandler={buttonLoading}
        saveHandler={onFormSave}
      />
    </Fragment>
  );
}

export default DesignTab;
