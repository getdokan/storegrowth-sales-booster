import FieldWrapper from "./FieldWrapper";
import { Col, InputNumber, Typography } from "antd";
import SettingsTooltip from "../SettingsTooltip";
import UpgradeCrown from "../UpgradeCrown";
import UpgradeOverlay from "../UpgradeOverlay";

const { Title } = Typography;

const Number = ({
  name,
  title,
  tooltip,
  disabled,
  fieldValue,
  changeHandler,
  placeHolderText,
  min = 1,
  colSpan = 24,
  needUpgrade = false,
  max = Number.MAX_VALUE,
  addonBefore = "",
  addonAfter = "",
  style = {},
}) => {
  return (
    // Make settings number component with card preview.
    <FieldWrapper colSpan={colSpan} align={"center"} upgradeClass={ needUpgrade ? `upgrade-settings` : '' }>
      <Col span={colSpan < 24 ? 18 : 15}>
        <div className={`card-heading`}>
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

      <Col span={colSpan < 24 ? 6 : 9}>
        {/* Handle settings number field by using dynamic props */}
        <InputNumber
          style={style}
          addonBefore={addonBefore}
          addonAfter={addonAfter}
          min={min}
          max={max}
          placeholder={placeHolderText}
          disabled={needUpgrade || disabled}
          value={fieldValue ? fieldValue : 0}
          className={`settings-field number-field`}
          onChange={(value) => changeHandler(name, value)}
        />
      </Col>
      { needUpgrade && <UpgradeOverlay /> }
    </FieldWrapper>
  );
};

export default Number;
