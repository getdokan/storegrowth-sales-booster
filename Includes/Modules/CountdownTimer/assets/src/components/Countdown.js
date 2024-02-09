import { Checkbox, DatePicker } from "antd";
import { __ } from "@wordpress/i18n";
import dayjs from "dayjs";

const Countdown = (props) => {
  const { onFieldChange, formData } = props;

  const {
    SGSettings: { EmptyField },
  } = window;

  // Reusable function for rendering conditional DatePicker
  const renderConditionalDatePicker = (
    title,
    fieldKey,
    disabledDateFn,
    defaultDate
  ) => (
    <div style={{ display: "block" }}>
      <h4>{title}</h4>
      <DatePicker
        onChange={(date, dateString) => onFieldChange(fieldKey, dateString)}
        disabledDate={disabledDateFn}
        value={defaultDate ? dayjs(defaultDate, "YYYY-MM-DD") : undefined}
        format="YYYY-MM-DD" 
      />
    </div>
  );

  const disabledStartDate = (current) =>
    current && current < dayjs().startOf("day");

  const disabledEndDate = (current) =>
    !formData.countdown_start_date ||
    current < dayjs(formData.countdown_start_date);

  return (
    <EmptyField
      title={__("Countdown", "storegrowth-sales-booster-pro")}
      tooltip={__("Actions of the button", "storegrowth-sales-booster-pro")}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: "10px",
          marginBottom: "20px",
          flexFlow: "wrap",
        }}
      >
        {renderConditionalDatePicker(
          "Start Date",
          "countdown_start_date",
          disabledStartDate,
          formData?.countdown_start_date
        )}
        {renderConditionalDatePicker(
          "End Date",
          "countdown_end_date",
          disabledEndDate,
          formData?.countdown_end_date
        )}
      </div>
    </EmptyField>
  );
};

export default Countdown;
