import { Switch, Select } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { __ } from "@wordpress/i18n";
import React from "react";
import EmptyField from "sales-booster/src/components/settings/Panels/PanelSettings/Fields/EmptyField";

const CuponCode = (props) => {

  return (
    <EmptyField
      title={__("Coupon Code", "storegrowth-sales-booster")}
      tooltip={__("Coupon code selector", "storegrowth-sales-booster")}
      needUpgrade={true}
    >
      <Switch
        style={ { marginTop: 7 } }
        checked={false}
        disabled={true}
        className={`settings-field switcher-field`}
        checkedChildren={__("Enable", "storegrowth-sales-booster")}
        unCheckedChildren={__("Disable", "storegrowth-sales-booster")}
      />
    </EmptyField>
  );
};

export default CuponCode;
