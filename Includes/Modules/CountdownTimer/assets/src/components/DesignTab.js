import { Fragment } from "react";
import { __ } from "@wordpress/i18n";
import { Form } from "antd";
import Selector from "./Selector";
import SettingsSection from "../../../../../../assets/src/components/settings/Panels/PanelSettings/SettingsSection";
import ColourPicker from "../../../../../../assets/src/components/settings/Panels/PanelSettings/Fields/ColorPicker";
import ActionsHandler from "sales-booster/src/components/settings/Panels/PanelSettings/ActionsHandler";

import "../styles/countdown-timer.css";
import Templates from "./Templates";
import SelectBox from "sales-booster/src/components/settings/Panels/PanelSettings/Fields/SelectBox";
import {applyFilters} from "@wordpress/hooks";

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

  const fontFamily = [
    {
      value: 'poppins',
      label: __('Poppins', 'storegrowth-sales-booster'),
    },
    {
      value: 'merienda',
      label: __('Merienda', 'storegrowth-sales-booster'),
    },
    {
      value: 'roboto',
      label: __('Roboto', 'storegrowth-sales-booster'),
    },
    {
      value: 'lato',
      label: __('Lato', 'storegrowth-sales-booster'),
    },
    {
      value: 'montserrat',
      label: __('Montserrat', 'storegrowth-sales-booster'),
    },
    {
      value: 'ibm_plex_sans',
      label: __('IBM Plex Sans', 'storegrowth-sales-booster'),
    },
  ];

  return (
    <Fragment>
      <SettingsSection>
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

        {/* Rendered countdown settings. */}
        { applyFilters(
          'sgsb_append_countdown_design_settings',
          '',
          formData,
          onFieldChange,
          showUndoIcon,
          undoHandler
        ) }

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
