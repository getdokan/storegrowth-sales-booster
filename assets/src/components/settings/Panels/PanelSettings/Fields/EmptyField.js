import { Typography, Col } from "antd";
import SettingsTooltip from "../SettingsTooltip";
import UpgradeCrown from "../UpgradeCrown";
import FieldWrapper from "./FieldWrapper";
const noop = () => {};
const { Title } = Typography;

const EmptyField = ({
  title,
  tooltip,
  colSpan = 24,
  needUpgrade = false,
  children,
  leftCol=9,
  rightCol =15
}) => {
  return (
    // Make settings textarea component with card preview.
    <FieldWrapper colSpan={colSpan}>
      <Col span={leftCol}>
        <div className={`card-heading textarea-heading`}>
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

      <Col span={rightCol}>
        {/* Handle settings textarea field by using dynamic props */}
        {children}
      </Col>
    </FieldWrapper>
  );
};

export default EmptyField;
