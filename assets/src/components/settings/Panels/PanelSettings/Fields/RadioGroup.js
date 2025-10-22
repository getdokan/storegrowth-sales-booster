import React from "react";
import { Radio, Col, Space, Typography } from "antd";
import FieldWrapper from "./FieldWrapper";
import SettingsTooltip from "../SettingsTooltip";
import UpgradeCrown from "../UpgradeCrown";
import UpgradeOverlay from "../UpgradeOverlay";
const { Title } = Typography;

/**
 * RadioGroup Component
 *
 * This component is designed for handling a group of radio group that control a single setting.
 * It provides the ability to select multiple options or switch to a single option mode, where only
 * one option can be selected at a time.
 *
 * @param {string} name - The name of the setting associated with the radio group.
 * @param {string} title - The title or label to display for the group of radio group.
 * @param {array} options - An array of objects representing the available radio group options.
 * @param {array} selectedOptions - An array of selected options (values) from the radio group.
 * @param {function} handleChange - A callback function to handle changes in radio group selections.
 * @param {boolean} isSingleMode - A boolean flag indicating whether to allow only one option to be selected at a time.
 * @param {number} colSpan - The number of columns to span for layout (default is 24 for full width).
 * @param {number} headColSpan - The number of columns to span for the header (default is 15).
 * @param {number} radioColSpan - The number of columns to span for the radio group (default is 9).
 * @param {string} displayDirection - The direction to display the options, either "vertical" or "horizontal" (default is "vertical").
 * @param {string} tooltip - An optional tooltip to display next to the title.
 * @param {boolean} needUpgrade - A boolean flag indicating whether this setting requires an upgrade.
 * @param {boolean} showProIcon - A boolean flag to show or hide the pro icon for options that need an upgrade (default is true).
 * @param {boolean} showSingleCheckOverlay - A boolean flag to show or hide the upgrade overlay for options that need an upgrade (default is true).
 * @param {ReactNode} children - Optional children elements to render below the radio group.
 *
 * Usage:
 * ```jsx
 * <RadioGroup
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
 *   handleChange={handleChange}
 *   isSingleMode={false}
 *   colSpan={24}
 * />
 * ```
 *
 * In the example above:
 * - `name`: The name of the setting associated with these radio group.
 * - `title`: The title or label for this group of radio group.
 * - `options`: An array of radio group options, where each option is an object with a label, value, and an optional needUpgrade flag.
 * - `selectedOptions`: An array of currently selected options (values).
 * - `handleChange`: A callback function that will be called when radio selections change.
 * - `isSingleMode`: Set to `true` to allow only one option to be selected at a time (radio button behavior).
 * - `colSpan`: The number of columns to span for layout purposes (default is 24 for full width).
 * - `displayDirection`: The direction to display the options, either "vertical" or "horizontal" (default is "vertical").
 *
 * Note: When `isSingleMode` is set to `true`, only one option can be selected at a time, and selecting a new option will automatically deselect the previously selected option.
 */

const RadioGroup = ({
  name,
  title,
  options,
  selectedOptions,
  handleChange,
  displayDirection = "vertical",
  isSingleMode = false,
  colSpan = 24,
  headColSpan = 15,
  radioColSpan = 9,
  tooltip,
  needUpgrade = false,
  showProIcon = true,
  showSingleCheckOverlay = true,
  children,
}) => {
  const itemHandleChange = (option) => {
    if (isSingleMode) {
      handleChange(name, option);
    } else {
      const updatedOptions = selectedOptions.includes(option)
        ? selectedOptions.filter((item) => item !== option)
        : [...selectedOptions, option];
      handleChange(name, updatedOptions);
    }
  };

  const noop = () => {};
  return (
    <FieldWrapper
      colSpan={colSpan}
      upgradeClass={needUpgrade ? `upgrade-settings` : ""}
    >
      <Col span={headColSpan}>
        <div className={`card-heading radio-input-heading`}>
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
      <Col span={radioColSpan}>
        <Space
          direction={displayDirection}
          style={{ flexFlow: "wrap" }}
        >
          {options.map((radio) => (
            <label
              className={`${
                radio.needUpgrade ? "disabled-checkbox" : "enabled-checkbox"
              }`}
              key={radio.value}
              style={{ display: "flex", gap: "4px" }}
            >
              <Radio
                checked={selectedOptions.includes(radio.value)}
                onChange={
                  radio.needUpgrade !== undefined && radio.needUpgrade
                    ? noop
                    : () => itemHandleChange(radio.value)
                }
                disabled={radio?.disabled || radio?.needUpgrade}
              >
                <span style={{ display: "flex", gap: "8px" }}>
                  {radio.label}
                  {radio.tooltip === undefined || radio.tooltip === "" ? (
                    ""
                  ) : (
                    <SettingsTooltip content={radio.tooltip} />
                  )}
                </span>
              </Radio>
              {radio.needUpgrade && showProIcon ? (
                <UpgradeCrown proBadge={false} />
              ) : (
                ""
              )}
              {radio.needUpgrade && showSingleCheckOverlay && (
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

export default RadioGroup;
