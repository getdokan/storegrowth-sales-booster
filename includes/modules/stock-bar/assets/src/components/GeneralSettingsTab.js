import { Fragment } from "react";
import { __ } from "@wordpress/i18n";
import SettingsSection from "sales-booster/src/components/settings/Panels/PanelSettings/SettingsSection";
import SingleCheckBox from "sales-booster/src/components/settings/Panels/PanelSettings/Fields/SingleCheckBox";
import ActionsHandler from "sales-booster/src/components/settings/Panels/PanelSettings/ActionsHandler";

function GeneralSettingsTab(props) {
  const {
    formData,
    onFieldChange,
    onFormSave,
    upgradeTeaser,
    buttonLoading,
    onFormReset,
    noop,
  } = props;

  return (
    <Fragment>
      <SettingsSection>
        <SingleCheckBox
          needUpgrade={upgradeTeaser}
          name={"shop_page_stock_bar_enable"}
          checkedValue={formData.shop_page_stock_bar_enable}
          className={`settings-field checkbox-field`}
          changeHandler={upgradeTeaser ? noop : onFieldChange}
          title={__("Display on Shop Page", "storegrowth-sales-booster")}
          tooltip={__(
            "The stock countdown bar will show on the shop page",
            "storegrowth-sales-booster"
          )}
        />
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
        <SingleCheckBox
          needUpgrade={upgradeTeaser}
          name={"variation_page_stock_bar_enable"}
          checkedValue={formData.variation_page_stock_bar_enable}
          className={`settings-field checkbox-field`}
          changeHandler={upgradeTeaser ? noop : onFieldChange}
          title={__(
            "Display on Variation Product Page",
            "storegrowth-sales-booster"
          )}
          tooltip={__(
            "The stock countdown bar will show on the variations product page",
            "storegrowth-sales-booster"
          )}
        />

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
