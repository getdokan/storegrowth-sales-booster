import { Fragment } from "react";
import { __ } from "@wordpress/i18n";
import { Form } from "antd";
import Selector from "./Selector";
import SettingsSection from "../../../../../../assets/src/components/settings/Panels/PanelSettings/SettingsSection";
import ColourPicker from "../../../../../../assets/src/components/settings/Panels/PanelSettings/Fields/ColorPicker";
import ActionsHandler from "sales-booster/src/components/settings/Panels/PanelSettings/ActionsHandler";

import "../styles/countdown-timer.css";
import Templates from "./Templates";

function DesignTab( props ) {
  const {
    formData,
    setFormData,
    onFieldChange,
    onFormSave,
    upgradeTeaser,
    buttonLoading,
    onFormReset,
    noop,
    options,
    handleSelect,
  } = props;

  return (
    <Fragment>
      <SettingsSection>
        <ColourPicker
          name={"widget_background_color"}
          fieldValue={formData.widget_background_color}
          changeHandler={onFieldChange}
          title={__("Widget Background Color", "storegrowth-sales-booster")}
        />

        <ColourPicker
          name={"border_color"}
          fieldValue={formData.border_color}
          changeHandler={onFieldChange}
          title={__("Border Color", "storegrowth-sales-booster")}
        />

        <ColourPicker
          name={"heading_text_color"}
          fieldValue={formData.heading_text_color}
          changeHandler={onFieldChange}
          title={__("Heading Text Color", "storegrowth-sales-booster")}
        />
        <ActionsHandler
          resetHandler={onFormReset}
          loadingHandler={buttonLoading}
          saveHandler={onFormSave}
        />
      </SettingsSection>

      <Templates formData={ formData } setFormData={ setFormData } />

      <Form.Item label="Theme" labelAlign="left">
        <div className="sgsb-countdown-theme">
          {options.map((option, index) => (
            <Selector
              key={index}
              option={option}
              onSelect={() => handleSelect(option.theme)}
              isSelected={option.theme === formData.selected_theme}
            />
          ))}
        </div>
      </Form.Item>
    </Fragment>
  );
}

export default DesignTab;
