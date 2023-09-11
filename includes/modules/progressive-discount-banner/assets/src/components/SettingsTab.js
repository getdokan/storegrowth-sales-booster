import {
  Form,
  Select,
  Switch,
  Typography,
  Input,
  Button,
  InputNumber,
} from "antd";
import { Fragment } from "react";
import { __ } from "@wordpress/i18n";
import Switcher from "../../../../../../assets/src/components/settings/Panels/PanelSettings/Fields/Switcher";
import SettingsSection from "../../../../../../assets/src/components/settings/Panels/PanelSettings/SettingsSection";
import DiscountBanner from "./DiscountBanner";
import DefaultBanner from "./DefaultBanner";
function SettingsTab(props) {
  const { formData, onFieldChange, onFormSave, buttonLoading, onIconChange } =
    props;

  return (
      <Fragment>
        <SettingsSection>
          <Switcher
            name={"default_banner"}
            changeHandler={onFieldChange}
            title={__("Default Banner", "storegrowth-sales-booster")}
            isEnable={
              formData.default_banner == "true" ||
              formData.default_banner == true
                ? true
                : false
            }
          />

          {formData.default_banner && (
            <DefaultBanner
              formData={formData}
              onFieldChange={onFieldChange}
              onIconChange={onIconChange}
            />
          )}

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
          />
          {formData.discount_banner && (
            <DiscountBanner
              formData={formData}
              onFieldChange={onFieldChange}
              onIconChange={onIconChange}
            />
          )}
					      <Button type="primary" onClick={onFormSave} loading={buttonLoading}>
        Save Changes
      </Button>

      <p className="ant-form-item-explain" style={{ margin: "15px 0 0 0" }}>
        Note: Please clear your cart in order to see the updates when you update
        these settings.
      </p>
        </SettingsSection>
      </Fragment>

  );
}

export default SettingsTab;
