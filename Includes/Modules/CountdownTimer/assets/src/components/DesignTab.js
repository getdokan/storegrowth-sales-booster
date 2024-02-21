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
    undoHandler,
    showUndoIcon
  } = props;

  return (
    <Fragment>
      <SettingsSection>
        <ColourPicker
          undoHandler={undoHandler}
          name={"widget_background_color"}
          fieldValue={formData.widget_background_color}
          showUndoIcon={showUndoIcon?.widget_background_color}
          changeHandler={onFieldChange}
          title={__("Widget Background Color", "storegrowth-sales-booster")}
        />

        <ColourPicker
          undoHandler={undoHandler}
          name={"border_color"}
          fieldValue={formData.border_color}
          showUndoIcon={showUndoIcon?.border_color}
          changeHandler={onFieldChange}
          title={__("Border Color", "storegrowth-sales-booster")}
        />

        <ColourPicker
          undoHandler={undoHandler}
          name={"heading_text_color"}
          fieldValue={formData.heading_text_color}
          showUndoIcon={showUndoIcon?.heading_text_color}
          changeHandler={onFieldChange}
          title={__("Heading Text Color", "storegrowth-sales-booster")}
        />
        <ActionsHandler
          resetHandler={onFormReset}
          loadingHandler={buttonLoading}
          saveHandler={onFormSave}
        />
      </SettingsSection>

      <Templates
        formData={ formData }
        setFormData={ setFormData }
        showUndoIcon={ showUndoIcon }
      />
    </Fragment>
  );
}

export default DesignTab;
