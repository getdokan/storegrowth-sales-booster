import { Fragment } from "react";
import { __ } from "@wordpress/i18n";
import { applyFilters } from "@wordpress/hooks";
import SettingsSection from "sales-booster/src/components/settings/Panels/PanelSettings/SettingsSection";
import SingleCheckBox from "sales-booster/src/components/settings/Panels/PanelSettings/Fields/SingleCheckBox";
import ActionsHandler from "sales-booster/src/components/settings/Panels/PanelSettings/ActionsHandler";
import SettingInstruction from "./SettingInstruction";

function GeneralSettingsTab(props) {
  const { formData, onFieldChange, onFormSave, buttonLoading, onFormReset } =
    props;

  return (
    <Fragment>
      <SettingsSection>
        {applyFilters(
          "sgsb_shop_stock_bar_enable_settings",
          "",
          formData,
          onFieldChange
        )}
        <SingleCheckBox
          name={"product_page_stock_bar_enable"}
          checkedValue={formData.product_page_stock_bar_enable}
          className={`settings-field checkbox-field`}
          changeHandler={onFieldChange}
          title={__("Display on Product Page", "storegrowth-sales-booster")}
          tooltip={__(
            "The stock countdown bar will show on the single product page",
            "storegrowth-sales-booster"
          )}
        />
        {applyFilters(
          "sgsb_variation_product_stock_bar_enable_settings",
          "",
          formData,
          onFieldChange
        )}
        <SettingInstruction />
        <ActionsHandler
          resetHandler={onFormReset}
          loadingHandler={buttonLoading}
          saveHandler={onFormSave}
        />
      </SettingsSection>
    </Fragment>
  );
}

export default GeneralSettingsTab;
