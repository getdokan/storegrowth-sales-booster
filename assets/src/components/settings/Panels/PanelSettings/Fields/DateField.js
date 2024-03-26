import {Typography, DatePicker, Col } from "antd";
import SettingsTooltip from "../SettingsTooltip";
import UpgradeCrown from "../UpgradeCrown";
import FieldWrapper from "./FieldWrapper";
import dayjs from "dayjs";

const { Title } = Typography;

const DateField = ({
  name,
  title,
  tooltip,
  fieldValue,
  changeHandler,
  endDateDisable = false,
  startDateValue = undefined,
  colSpan = 24,
  fullWidth = false,
  needUpgrade = false,
}) => {
  const renderConditionalDatePicker = (
    fieldKey,
    disabledDateFn,
    defaultDate
  ) => (
    <DatePicker
      style={{ width: '100%' }}
      onChange={(date, dateString) => changeHandler(fieldKey, dateString)}
      disabledDate={disabledDateFn}
      disabled={needUpgrade}
      value={defaultDate ? dayjs(defaultDate, "YYYY-MM-DD") : undefined}
      format="YYYY-MM-DD" // Set the display format to include time
    />
  );

  const disabledStartDate = (current) =>
    current && current < dayjs().startOf("day");

  const disabledEndDate = (current) =>
    !startDateValue ||
    current < dayjs(startDateValue);

  let dateDisableFn = endDateDisable ? disabledEndDate : disabledStartDate;
  return (
    <FieldWrapper
      colSpan={colSpan}
      upgradeClass={needUpgrade ? `upgrade-settings` : ""}
    >
      <Col span={fullWidth ? 9 : 14}>
        <div className={`card-heading textinput-heading`}>
          {/* Handle switcher title. */}
          <Title level={3} className={`settings-heading space-top`}>
            {title}
          </Title>
          {/* Handle switcher tooltip. */}
          {tooltip && <SettingsTooltip content={tooltip} />}
          {/* Handle switcher upgrade icon. */}
          {needUpgrade && <UpgradeCrown />}
        </div>
      </Col>

      <Col span={fullWidth ? 15 : 10}>
        {/* Handle settings textarea field by using dynamic props */}
        {renderConditionalDatePicker(name, dateDisableFn, fieldValue)}
      </Col>
    </FieldWrapper>
  );
};

export default DateField;
