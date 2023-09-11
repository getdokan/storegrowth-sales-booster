import { Form, Select, Input, InputNumber } from "antd";
import { RemovableIconPicker } from "./RemovableIconPicker";
import { Fragment } from "react";
import { __ } from "@wordpress/i18n";
import Switcher from "../../../../../../assets/src/components/settings/Panels/PanelSettings/Fields/Switcher";
import TextAreaBox from "../../../../../../assets/src/components/settings/Panels/PanelSettings/Fields/TextAreaBox";
import SettingsSection from "../../../../../../assets/src/components/settings/Panels/PanelSettings/SettingsSection";

function DefaultBanner(props) {
  const { formData, onFieldChange, onIconChange } = props;

  return (
    <Fragment>
        <TextAreaBox
          areaRows={3}
          colSpan ={24}
          name={"default_banner_text"}
          fieldValue={formData.default_banner_text}
          changeHandler={onFieldChange}
          title={__("Default Banner Text", "storegrowth-sales-booster")}
          placeHolderText={__(
            `Shop more than ${sgsbAdmin.currencySymbol}100 to get free shipping.`,
            "storegrowth-sales-booster"
          )}
        />
          <Form.Item label="Default Banner Icon" labelAlign="left">
            <RemovableIconPicker
              onClear={(v) =>
                onIconChange(
                  "default_banner_icon_name",
                  "default_banner_icon_html",
                  ""
                )
              }
              onChange={(v) =>
                onIconChange(
                  "default_banner_icon_name",
                  "default_banner_icon_html",
                  v
                )
              }
              value={formData.default_banner_icon_name}
            />
          </Form.Item>
    </Fragment>
  );
}

export default DefaultBanner;
