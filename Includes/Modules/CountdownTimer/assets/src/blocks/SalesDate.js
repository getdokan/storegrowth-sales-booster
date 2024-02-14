import {  DatePicker } from "antd";
import { __ } from "@wordpress/i18n";
import dayjs from "dayjs";

const SalesDate = (props) => {
  const { onFieldChange, attributes } = props;

  // Reusable function for rendering conditional SalesDate
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
    !attributes.startDate ||
    current < dayjs(attributes.startDate);

  return (
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
          "startDate",
          disabledStartDate,
          attributes?.startDate
        )}
        {renderConditionalDatePicker(
          "End Date",
          "endDate",
          disabledEndDate,
          attributes?.endDate
        )}
      </div>
  );
};

export default SalesDate;
