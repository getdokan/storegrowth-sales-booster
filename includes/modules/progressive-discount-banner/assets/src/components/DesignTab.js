import { Fragment } from "react";
import { __ } from "@wordpress/i18n";
import { Button } from "antd";
import SelectBox from "../../../../../../assets/src/components/settings/Panels/PanelSettings/Fields/SelectBox";
import SettingsSection from "../../../../../../assets/src/components/settings/Panels/PanelSettings/SettingsSection";
import ColourPicker from "../../../../../../assets/src/components/settings/Panels/PanelSettings/Fields/ColorPicker";

function DesignTab(props) {
  const { formData, onFieldChange, onFormSave, buttonLoading } = props;
  const barPositions = [
    {
      value: "top",
      label: __("Top", "storegrowth-sales-booster"),
    },
    {
      value: "bottom",
      label: __("Bottom", "storegrowth-sales-booster"),
    },
  ];

  return (
    <Fragment>
      <SettingsSection>
        <SelectBox
          name={`bar_position`}
          options={[...barPositions]}
          fieldValue={formData.bar_position}
          changeHandler={onFieldChange}
          title={__("Bar Position", "storegrowth-sales-booster")}
        />

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
      </SettingsSection>

      <Button
        type="primary"
        onClick={onFormSave}
        loading={buttonLoading}
        className="sgsb-settings-save-button"
      >
        Save
      </Button>
    </Fragment>
  );
}

export default DesignTab;
