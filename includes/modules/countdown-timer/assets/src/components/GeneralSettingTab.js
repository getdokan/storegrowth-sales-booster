import { Fragment } from "react";
import { __ } from "@wordpress/i18n";
import SettingsSection from "../../../../../../assets/src/components/settings/Panels/PanelSettings/SettingsSection";

import "../styles/countdown-timer.css";
import TextInput from "../../../../../../assets/src/components/settings/Panels/PanelSettings/Fields/TextInput";
import SingleCheckBox from "../../../../../../assets/src/components/settings/Panels/PanelSettings/Fields/SingleCheckBox";
import ActionsHandler from "sales-booster/src/components/settings/Panels/PanelSettings/ActionsHandler";

function GeneralSettingTab(props) {
  const {
    formData,
    onFieldChange,
    onFormSave,
    buttonLoading,
    upgradeTeaser,
    onFormReset,
    noop,
  } = props;
  return (
    <Fragment>
      <SettingsSection>
        <TextInput
          name={"countdown_heading"}
          placeHolderText={__(
            "Last chance! [discount]% OFF",
            "storegrowth-sales-booster"
          )}
          fieldValue={formData.countdown_heading}
          className={`settings-field input-field`}
          changeHandler={onFieldChange}
          title={__("Countdown Heading", "storegrowth-sales-booster")}
          tooltip={__(
            "The [discount] will be replace with your actual discount percentage. e.g. Last chance! [discount]% OFF",
            "storegrowth-sales-booster"
          )}
        />

        <SingleCheckBox
          needUpgrade={upgradeTeaser}
          name={"shop_page_countdown_enable"}
          checkedValue={formData.shop_page_countdown_enable}
          className={`settings-field checkbox-field`}
          changeHandler={upgradeTeaser ? noop : onFieldChange}
          title={__("Shop Page Display", "storegrowth-sales-booster")}
          tooltip={__(
            "The sales countdown will show on the shop page",
            "storegrowth-sales-booster"
          )}
        />
        <SingleCheckBox
          name={"product_page_countdown_enable"}
          checkedValue={formData.product_page_countdown_enable}
          className={`settings-field checkbox-field`}
          changeHandler={onFieldChange}
          title={__("Product Page Display", "storegrowth-sales-booster")}
          tooltip={__(
            "The countdown will show on the single product page",
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

export default GeneralSettingTab;
