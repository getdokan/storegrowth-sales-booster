import { Radio, InputNumber } from "antd";
import { __ } from "@wordpress/i18n";
import EmptyField from "../../../../../../assets/src/components/settings/Panels/PanelSettings/Fields/EmptyField";

const BannerTrigger = (props) => {
  const { upgradeTeaser, onFieldChange, formData } = props;
  const noop = () => {};
  // Hardcoded options
  const triggerOptions = [
    { value: "after-few-seconds", label: "After a few Seconds" },
    { value: "after-scroll", label: "After Scroll" },
  ];
  const banner_trigger_value = formData.banner_trigger
  return (
    <>
      <EmptyField
        needUpgrade={upgradeTeaser}
        title={__("Trigger", "storegrowth-sales-booster")}
        tooltip={__(
          `Choose when you'd like the welcome bar to appear on your site`,
          "storegrowth-sales-booster"
        )}
        leftCol={ 12 }
        rightCol={ 12 }
      >
        <Radio.Group
          style={{
            width: "100%",
          }}
          disabled={upgradeTeaser}
          onChange={upgradeTeaser ? noop : (event)=>{
            onFieldChange("banner_trigger", event.target.value);
          }}
          defaultValue={formData.banner_trigger}
        >
          {triggerOptions.map((option) => (
            <div
              className={option.value===banner_trigger_value?"trigger-radio-selected":""}
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
                // Hardcoded input field names and values
                disabled={upgradeTeaser}
                style={{
                  width: "20%",
                  borderColor: "#DDE6F9",
                }}
                name={
                  option.value === "after-few-seconds"
                    ? "banner_delay"
                    : "scroll_banner_delay"
                }
                value={
                  option.value === "after-few-seconds"
                    ? formData.banner_delay
                    : formData.scroll_banner_delay
                }
                onChange={(event) =>
                  upgradeTeaser
                    ? noop
                    : onFieldChange(
                        option.value === "after-few-seconds"
                          ? "banner_delay"
                          : "scroll_banner_delay",
                        event.target.value
                      )
                }
                placeholder={`sec`}
              />
            </div>
          ))}
        </Radio.Group>
      </EmptyField>
    </>
  );
};

export default BannerTrigger;
