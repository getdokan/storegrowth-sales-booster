import { Checkbox, DatePicker } from "antd";
import { __ } from "@wordpress/i18n";
import EmptyField from "../../../settings/Panels/PanelSettings/Fields/EmptyField";

const Countdown = (props) => {

  // Reusable function for rendering conditional DatePicker
  const renderConditionalDatePicker = (
    title
  ) => (
    <div style={{ display: "block" }}>
      <h4>{title}</h4>
      <DatePicker
        disabled={true}
        value={undefined}
        format="YYYY-MM-DD" // Set the display format to include time
      />
    </div>
  );

  return (
    <EmptyField
      title={__("Countdown", "storegrowth-sales-booster")}
      tooltip={__("Actions of the button", "storegrowth-sales-booster")}
      needUpgrade={true}
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
        )}
        {renderConditionalDatePicker(
          "End Date",
        )}
      </div>
      <Checkbox
        disabled={true}
        value={"countdown_show_enable"}
        checked={false}
      >
        Show Countdown
      </Checkbox>
    </EmptyField>
  );
};

export default Countdown;
