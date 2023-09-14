import { Button } from "antd";
import { Fragment } from "react";
import { __ } from "@wordpress/i18n";
import Switcher from "../../../../../../assets/src/components/settings/Panels/PanelSettings/Fields/Switcher";
import SettingsSection from "../../../../../../assets/src/components/settings/Panels/PanelSettings/SettingsSection";
import SectionSpacer from "../../../../../../assets/src/components/settings/Panels/PanelSettings/SectionSpacer";
import DiscountBanner from "./DiscountBanner";
import DefaultBanner from "./DefaultBanner";
function SettingsTab(props) {
  const {
    formData,
    onFieldChange,
    onFormSave,
    buttonLoading,
    onIconChange,
    upgradeTeaser,
  } = props;

  const FreeShippingExtra = (
    <div>
      You need to set up free shipping on{" "}
      <a href="admin.php?page=wc-settings&tab=shipping">
        WooCommerce Shipping Settings
      </a>{" "}
      page.
    </div>
  );

  return (
    <>
      <SettingsSection>
        <Switcher
          name={"default_banner"}
          changeHandler={onFieldChange}
          title={__("Default Banner", "storegrowth-sales-booster")}
          isEnable={
            formData.default_banner == "true" || formData.default_banner == true
              ? true
              : false
          }
          tooltip={__(
            "Use this setting to enter text for a standard banner. You can display important messages, announcements, or promotions to engage your website visitors. ",
            "storegrowth-sales-booster"
          )}
        />
      </SettingsSection>
      {formData.default_banner && (
        <DefaultBanner
          formData={formData}
          onFieldChange={onFieldChange}
          onIconChange={onIconChange}
          upgradeTeaser={upgradeTeaser}
        />
      )}
      <SectionSpacer />
      <SettingsSection>
        <Switcher
          name={"discount_banner"}
          changeHandler={onFieldChange}
          title={__("Free Shipping Banner", "storegrowth-sales-booster")}
          isEnable={
            formData.discount_banner == "true" ||
            formData.discount_banner == true
              ? true
              : false
          }
          tooltip={__(FreeShippingExtra, "storegrowth-sales-booster")}
        />
      </SettingsSection>
      {formData.discount_banner && (
        <DiscountBanner
          formData={formData}
          onFieldChange={onFieldChange}
          onIconChange={onIconChange}
          upgradeTeaser={upgradeTeaser}
        />
      )}
      <Button
        type="primary"
        onClick={onFormSave}
        loading={buttonLoading}
        className="sgsb-settings-save-button"
      >
        Save
      </Button>

      <p className="ant-form-item-explain" style={{ margin: "15px 0 0 0" }}>
        Note: Please clear your cart in order to see the updates when you update
        these settings.
      </p>
    </>
  );
}

export default SettingsTab;
