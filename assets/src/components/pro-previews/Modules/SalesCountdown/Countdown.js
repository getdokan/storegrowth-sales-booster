import { DatePicker } from "antd";
import { __ } from "@wordpress/i18n";
import dayjs from "dayjs";

const Countdown = (props) => {
  const { onFieldChange, formData } = props;

  const {
    SGSettings: { EmptyField },
  } = window;

  // Reusable function for rendering conditional DatePicker
  const renderConditionalDatePicker = (
    title
  ) => (
    <div style={{ display: "block" }}>
      <h4>{title}</h4>
      <DatePicker
        format="YYYY-MM-DD" 
      />
    </div>
  );

  return (
    <EmptyField
      needUpgrade ={true}
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
          "Start Date"
        )}
        {renderConditionalDatePicker(
          "End Date"
        )}
      </div>
    </EmptyField>
  );
};

export default Countdown;
