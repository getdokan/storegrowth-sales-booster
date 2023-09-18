import { Checkbox, DatePicker } from "antd";
import { __ } from "@wordpress/i18n";
import EmptyField from "../../../../../../assets/src/components/settings/Panels/PanelSettings/Fields/EmptyField";
import dayjs from "dayjs";

const Countdown = (props) => {
  const { upgradeTeaser, onFieldChange, formData } = props;

  // Reusable function for rendering conditional DatePicker
  const renderConditionalDatePicker = (
    title,
    fieldKey,
    disabledDateFn,
    defaultDate,
    isStartDate
  ) => (
    <div style={{ display: "block" }}>
      <h4>{title}</h4>
      <DatePicker
        style={{
          width: "150px",
        }}
        onChange={(date, dateString) => onFieldChange(fieldKey, dateString)}
        disabledDate={disabledDateFn}
        defaultValue={dayjs(defaultDate, "YYYY-MM-DD")} // Set the default value using dayjs and the specified format
        format="YYYY-MM-DD" // Set the display format to include time
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
      title={__("Countdown", "storegrowth-sales-booster")}
      tooltip={__("Actions of the button", "storegrowth-sales-booster")}
      needUpgrade={upgradeTeaser}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: "10px",
          marginBottom: "20px",
        }}
      >
        {renderConditionalDatePicker(
          "Start Date",
          "countdown_start_date",
          disabledStartDate,
          formData.countdown_start_date,
          true // Indicate that this is the start date
        )}
        {renderConditionalDatePicker(
          "End Date",
          "countdown_end_date",
          disabledEndDate,
          formData.countdown_end_date,
          false // Indicate that this is the end date
        )}
      </div>
      <Checkbox
        value={"countdown_show_enable"}
        checked={formData.countdown_show_enable}
        onChange={(event) =>
          onFieldChange("countdown_show_enable", event.target.checked)
        }
      >
        Show Countdown
      </Checkbox>
    </EmptyField>
  );
};

export default Countdown;
