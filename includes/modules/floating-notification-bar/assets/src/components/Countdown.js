import { Checkbox, DatePicker } from "antd";
import { __ } from "@wordpress/i18n";
import EmptyField from "../../../../../../assets/src/components/settings/Panels/PanelSettings/Fields/EmptyField";
import moment from "moment";

const Countdown = (props) => {
  const { upgradeTeaser, onFieldChange, formData } = props;

  // Reusable function for DatePicker components
  const renderDatePicker = (title, fieldKey, disabledDateFn) => (
    <div style={{ display: "block" }}>
      <h4>{title}</h4>
      <DatePicker
        style={{
          width:"150px"
        }}
        onChange={(date, dateString) => onFieldChange(fieldKey, dateString)}
        disabledDate={disabledDateFn}
      />
    </div>
  );

  const disabledStartDate = (current) =>
    current && current < moment().startOf("day");

  const disabledEndDate = (current) =>
    !formData.countdown_start_date ||
    current < moment(formData.countdown_start_date);

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
        {renderDatePicker("Start Date", "countdown_start_date", disabledStartDate)}
        {renderDatePicker("End Date", "countdown_end_date", disabledEndDate)}
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
