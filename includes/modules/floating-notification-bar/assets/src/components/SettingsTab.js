import { Button } from "antd";
import { Fragment } from "react";
import { __ } from "@wordpress/i18n";
import Switcher from "../../../../../../assets/src/components/settings/Panels/PanelSettings/Fields/Switcher";
import SettingsSection from "../../../../../../assets/src/components/settings/Panels/PanelSettings/SettingsSection";
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
      <DefaultBanner
        formData={formData}
        onFieldChange={onFieldChange}
        onIconChange={onIconChange}
        upgradeTeaser={upgradeTeaser}
      />

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
