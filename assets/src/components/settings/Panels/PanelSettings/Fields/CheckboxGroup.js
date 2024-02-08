import React from "react";
import { Checkbox, Col, Space, Typography } from "antd";
import FieldWrapper from "./FieldWrapper";
import SettingsTooltip from "../SettingsTooltip";
import UpgradeCrown from "../UpgradeCrown";
import UpgradeOverlay from "../UpgradeOverlay";
const { Title } = Typography;

/**
 * CheckboxGroup Component
 *
 * This component is designed for handling a group of checkboxes that control a single setting.
 * It provides the ability to select multiple options or switch to a single option mode, where only
 * one option can be selected at a time.
 *
 * @param {string} name - The name of the setting associated with the checkboxes.
 * @param {string} title - The title or label to display for the group of checkboxes.
 * @param {array} options - An array of objects representing the available checkbox options.
 * @param {array} selectedOptions - An array of selected options (values) from the checkboxes.
 * @param {function} handleCheckboxChange - A callback function to handle changes in checkbox selections.
 * @param {boolean} isSingleMode - A boolean flag indicating whether to allow only one option to be selected at a time.
 * @param {number} colSpan - The number of columns to span for layout (default is 24 for full width).
 *
 * Usage:
 * ```jsx
 * <CheckboxGroup
 *   name="exampleSetting"
 *   title="Example Setting"
 *   options={[
 *     {
      label: `"Add to cart" as "Buy Now"`,
      value: "cart-to-buy-now",
      needUpgrade: upgradeTeaser,
      tooltip: __(
        "Use the add to cart button as the buy now button",
        "storegrowth-sales-booster"
      ),
    },
    {
      label: `"Buy Now" with "Add to cart"`,
      value: "cart-with-buy-now",
      tooltip: __("", "storegrowth-sales-booster"),
    },
 *     // Add more options as needed
 *   ]}
 *   selectedOptions={selectedOptions}
 *   handleCheckboxChange={handleCheckboxChange}
 *   isSingleMode={false}
 *   colSpan={24}
 * />
 * ```
 *
 * In the example above:
 * - `name`: The name of the setting associated with these checkboxes.
 * - `title`: The title or label for this group of checkboxes.
 * - `options`: An array of checkbox options, where each option is an object with a label, value, and an optional needUpgrade flag.
 * - `selectedOptions`: An array of currently selected options (values).
 * - `handleCheckboxChange`: A callback function that will be called when checkbox selections change.
 * - `isSingleMode`: Set to `true` to allow only one option to be selected at a time (radio button behavior).
 * - `colSpan`: The number of columns to span for layout purposes (default is 24 for full width).
 *
 * Note: When `isSingleMode` is set to `true`, only one option can be selected at a time, and selecting a new option will automatically deselect the previously selected option.
 */

const CheckboxGroup = ({
  name,
  title,
  options,
  selectedOptions,
  handleCheckboxChange,
  displayDirection = "vertical",
  isSingleMode = false,
  colSpan = 24,
  headColSpan = 15,
  checkboxColSpan = 9,
  tooltip,
  needUpgrade = false,
  showProIcon = true,
  showSingleCheckOverlay = true,
  children,
}) => {
  const handleChange = (option) => {
    if (isSingleMode) {
      handleCheckboxChange(name, option);
    } else {
      const updatedOptions = selectedOptions.includes(option)
        ? selectedOptions.filter((item) => item !== option)
        : [...selectedOptions, option];
      handleCheckboxChange(name, updatedOptions);
    }
  };

  const noop = () => {};
  return (
    <FieldWrapper
      colSpan={colSpan}
      upgradeClass={needUpgrade ? `upgrade-settings` : ""}
    >
      <Col span={headColSpan}>
        <div className={`card-heading checkboxinput-heading`}>
          {/* Handle switcher title. */}
          <Title level={3} className={`settings-heading`}>
            {title}
          </Title>
          {/* Handle switcher tooltip. */}
          {tooltip && <SettingsTooltip content={tooltip} />}
          {/* Handle switcher upgrade icon. */}
          {needUpgrade && <UpgradeCrown />}
        </div>
      </Col>
      <Col span={checkboxColSpan}>
        <Space
          direction={displayDirection}
          className="checkbox-container"
          style={{ flexFlow: "wrap" }}
        >
          {options.map((checkbox) => (
            <label
              className={`${
                checkbox.needUpgrade ? "disabled-checkbox" : "enabled-checkbox"
              }`}
              key={checkbox.value}
              style={{ display: "flex", gap: "4px" }}
            >
              <Checkbox
                checked={selectedOptions.includes(checkbox.value)}
                onChange={
                  checkbox.needUpgrade !== undefined && checkbox.needUpgrade
                    ? noop
                    : () => handleChange(checkbox.value)
                }
                disabled={checkbox?.disabled || checkbox?.needUpgrade}
              >
                <span style={{ display: "flex", gap: "8px" }}>
                  {checkbox.label}
                  {checkbox.tooltip === undefined || checkbox.tooltip === "" ? (
                    ""
                  ) : (
                    <SettingsTooltip content={checkbox.tooltip} />
                  )}
                </span>
              </Checkbox>
              {checkbox.needUpgrade && showProIcon ? (
                <UpgradeCrown proBadge={false} />
              ) : (
                ""
              )}
              {checkbox.needUpgrade && showSingleCheckOverlay && (
                <UpgradeOverlay />
              )}
            </label>
          ))}
        </Space>
        {children}
      </Col>
      {needUpgrade && <UpgradeOverlay />}
    </FieldWrapper>
  );
};

export default CheckboxGroup;
