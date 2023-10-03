import { Typography, Checkbox, Col } from "antd";
import SettingsTooltip from "../SettingsTooltip";
import UpgradeCrown from "../UpgradeCrown";
import FieldWrapper from "./FieldWrapper";

/**
 * A customizable checkbox component for use in settings or configuration forms.
 *
 * @component
 *
 * @param {Object} props - The properties passed to the component.
 * @param {string} props.name - A unique identifier for the checkbox.
 * @param {boolean} props.checkedValue - The current state of the checkbox.
 * @param {function} props.changeHandler - A function to handle checkbox state changes.
 * @param {string} props.title - The title or label for the checkbox.
 * @param {string} [props.tooltip] - An optional tooltip to provide additional information about the checkbox.
 * @param {boolean} [props.needUpgrade=false] - Optional. If true, it displays an upgrade icon next to the checkbox.
 * @param {number} [props.colSpan=24] - Optional. The column span for layout purposes.
 * @param {number} [props.areaRows] - Optional. The number of rows for the checkbox area.
 *
 * @example
 * // Usage example:
 * <SingleCheckBox
 *   name={"shop_page_checkout_enable"}
 *   checkedValue={settings.shop_page_checkout_enable}
 *   changeHandler={onFieldChange}
 *   title={"Display on Shop Page"}
 *   tooltip={"This will set the Label of the Buy Now Button"}
 *   needUpgrade={false}
 * />
 */


const { Title } = Typography;

const SingleCheckBox = ({
  name,
  title,
  tooltip,
  areaRows,
  checkedValue,
  changeHandler,
  colSpan = 24,
  needUpgrade = false,
}) => {
  return (
    // Make settings checkbox component with card preview.
    <FieldWrapper colSpan={colSpan} upgradeClass={ needUpgrade ? `upgrade-settings` : '' }>
      <Col span={15}>
        <div className={`card-heading checkbox-heading`}>
          {/* Handle checkbox title. */}
          <Title level={3} className={`settings-heading`}>
            {title}
          </Title>
          {/* Handle checkbox tooltip. */}
          {tooltip && <SettingsTooltip content={tooltip} />}
          {/* Handle checkbox settings upgrade icon. */}
          {needUpgrade && <UpgradeCrown />}
        </div>
      </Col>

      <Col span={9}>
        {/* Handle settings checkbox field by using dynamic props */}
        <Checkbox
          rows={areaRows}
          disabled={needUpgrade}
          checked = {checkedValue}
          value={name}
          className={`settings-field singlecheckbox-field ${ needUpgrade ? 'disabled-settings' : '' }`}
          onChange={(event) => changeHandler(name, event.target.checked)}
        >
        </Checkbox>
      </Col>
    </FieldWrapper>
  );
};

export default SingleCheckBox;
