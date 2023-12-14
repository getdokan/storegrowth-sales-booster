import { Radio, InputNumber } from "antd";
import { __ } from "@wordpress/i18n";
import EmptyField from "../../../../../../assets/src/components/settings/Panels/PanelSettings/Fields/EmptyField";
import { Fragment } from "react";

const BannerTrigger = () => {
  // Hardcoded options
  const triggerOptions = [
    { value: "after-few-seconds", label: __("After a few Seconds","storegrowth-sales-booster") },
    { value: "after-scroll", label: __("After Scroll","storegrowth-sales-booster") },
  ];
  return (
    <Fragment>
      <EmptyField
        needUpgrade={true}
        title={__("Trigger", "storegrowth-sales-booster")}
        tooltip={__(
          `Choose when you'd like the welcome bar to appear on your site`,
          "storegrowth-sales-booster"
        )}
      >
        <Radio.Group
          style={{
            width: "100%",
          }}
          disabled={true}
          value={"after-few-seconds"}
        >
          {triggerOptions.map((option) => (
            <div
              className={
                option.value === "after-few-seconds"
                  ? "trigger-radio-selected"
                  : ""
              }
              key={option.value}
              style={{
                display: "flex",
                gap: "10px",
                marginBottom: "20px",
                justifyContent: "space-between",
                alignItems: "center",
                border: "1px solid #DDE6F9",
                padding: 16,
                borderRadius: 5,
              }}
            >
              <Radio value={option.value}>{option.label}</Radio>
              <InputNumber
                min={0}
                // Hardcoded input field names and values
                disabled={true}
                style={{
                  width: "20%",
                  borderColor: "#DDE6F9",
                }}
                name={"banner_delay"}
                value={7}
                placeholder={`sec`}
              />
            </div>
          ))}
        </Radio.Group>
      </EmptyField>
    </Fragment>
  );
};

export default BannerTrigger;
