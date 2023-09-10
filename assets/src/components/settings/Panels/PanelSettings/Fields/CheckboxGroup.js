import React from "react";
import { Checkbox, Col, Space,Typography } from "antd";
import FieldWrapper from "./FieldWrapper";
import SettingsTooltip from "../SettingsTooltip";
import UpgradeCrown from "../UpgradeCrown";
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
 *     { label: "Option 1", value: "option1", needUpgrade: false },
 *     { label: "Option 2", value: "option2", needUpgrade: true },
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
  isSingleMode,
  colSpan = 24,
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

  return (
    <FieldWrapper colSpan={colSpan}>
      <Col span={9}>
        <div className={`card-heading checkboxinput-heading`}>
          {/* Handle switcher title. */}
          <Title level={3} className={`settings-heading`}>
            {title}
          </Title>
        </div>
      </Col>
      <Col span={15}>
        <Space direction="vertical">
          {options.map((checkbox) => (
            <label key={checkbox.value}>
              <Checkbox
                checked={selectedOptions.includes(checkbox.value)}
                onChange={() => handleChange(checkbox.value)}
                disabled={checkbox.needUpgrade}
              >
                <span style={{ display: "flex", gap: "8px" }}>
                  {checkbox.needUpgrade
                    ? checkbox.label(<UpgradeCrown />)
                    : checkbox.label}
                  {checkbox.tooltip === "" ? (
                    ""
                  ) : (
                    <SettingsTooltip content={checkbox.tooltip} />
                  )}
                </span>
              </Checkbox>
            </label>
          ))}
        </Space>
      </Col>
    </FieldWrapper>
  );
};

export default CheckboxGroup;
