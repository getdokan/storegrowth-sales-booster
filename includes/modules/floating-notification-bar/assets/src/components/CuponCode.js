import { Switch, Select } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { __ } from "@wordpress/i18n";
import React from "react";
import EmptyField from "sales-booster/src/components/settings/Panels/PanelSettings/Fields/EmptyField";

const CuponCode = ({
  noop,
  formData,
  upgradeTeaser,
  onFieldChange,
  needUpgrade = false,
}) => {
  const filterOption = (input, option) =>
    (option?.label ?? "").toLowerCase().includes(input.toLowerCase());

  return (
    <EmptyField
      title={__("Coupon Code", "storegrowth-sales-booster")}
      tooltip={__("Coupon code selector", "storegrowth-sales-booster")}
      needUpgrade={upgradeTeaser}
    >
      <Switch
        style={ { marginTop: 7 } }
        checked={formData.show_cupon}
        disabled={upgradeTeaser}
        className={`settings-field switcher-field`}
        onChange={
          upgradeTeaser ? noop : (value) => onFieldChange("show_cupon", value)
        }
        checkedChildren={__("Enable", "storegrowth-sales-booster")}
        unCheckedChildren={__("Disable", "storegrowth-sales-booster")}
      />
      {formData.show_cupon && (
        <div style={{ marginTop: 40 }}>
          <span>Select Coupon</span>
          <Select
            className="coupon-code-input-field"
            suffixIcon={<SearchOutlined />}
            // the coupon data is coming from the localize data.
            options={sgsb_fnb_coupon_data}
            value={formData.cupon_code}
            disabled={upgradeTeaser}
            showSearch={true}
            // placeholder={placeHolderText}
            onChange={
              upgradeTeaser
                ? noop
                : (event) => onFieldChange("cupon_code", event)
            }
            filterOption={filterOption ? filterOption : true}
            style={{ width: "100%", marginTop: "5px" }}
          />
        </div>
      )}
    </EmptyField>
  );
};

export default CuponCode;
