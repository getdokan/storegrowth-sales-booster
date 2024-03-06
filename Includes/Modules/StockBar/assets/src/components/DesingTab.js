import { Fragment } from "react";
import { __ } from "@wordpress/i18n";
import { applyFilters } from '@wordpress/hooks';
import SettingsSection from "sales-booster/src/components/settings/Panels/PanelSettings/SettingsSection";
import ColourPicker from "sales-booster/src/components/settings/Panels/PanelSettings/Fields/ColorPicker";
import ActionsHandler from "sales-booster/src/components/settings/Panels/PanelSettings/ActionsHandler";
import Templates from "./Templates";
import Switcher from "sales-booster/src/components/settings/Panels/PanelSettings/Fields/Switcher";
import {TextInput} from "sales-booster/src/components/settings/Panels";
import Number from "sales-booster/src/components/settings/Panels/PanelSettings/Fields/Number";

function DesignTab(props) {
  const {
    formData,
    setFormData,
    onFieldChange,
    onFormSave,
    buttonLoading,
    onFormReset,
  } = props;

  return (
    <Fragment>
      <SettingsSection>
        <ColourPicker
          name={"stockbar_bg_color"}
          fieldValue={formData.stockbar_bg_color}
          changeHandler={onFieldChange}
          title={__("Foreground Color", "storegrowth-sales-booster")}
        />
        { applyFilters(
          'sgsb_bar_color_stock_bar_settings',
          '',
          formData,
          onFieldChange
        ) } 
        <ColourPicker
          name={"stockbar_border_color"}
          fieldValue={formData.stockbar_border_color}
          changeHandler={onFieldChange}
          title={__("Border Color", "storegrowth-sales-booster")}
        />

        { applyFilters(
          'sgsb_design_panel_stock_bar_settings',
          '',
          formData,
          onFieldChange
        ) }

        <Switcher
          name={ 'show_stock_status' }
          changeHandler={ onFieldChange }
          isEnable={ Boolean( formData.show_stock_status ) }
          title={ __( 'Stock Status', 'storegrowth-sales-booster' ) }
          tooltip={ __( 'We can customize and control stock status content.', 'storegrowth-sales-booster' ) }
        />

        { Boolean( formData.show_stock_status ) && applyFilters(
          'sgsb_append_after_stock_status_settings',
          '',
          formData,
          onFieldChange
        ) }
      </SettingsSection>

      <Templates
        formData={ formData }
        setFormData={ setFormData }
      />

      <ActionsHandler
        resetHandler={onFormReset}
        loadingHandler={buttonLoading}
        saveHandler={onFormSave}
      />
    </Fragment>
  );
}

export default DesignTab;
