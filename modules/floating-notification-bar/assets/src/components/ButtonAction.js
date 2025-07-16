import { Select, Input, Checkbox } from "antd";
import { __ } from "@wordpress/i18n";
import { applyFilters } from "@wordpress/hooks";
import EmptyField from "../../../../../../assets/src/components/settings/Panels/PanelSettings/Fields/EmptyField";

const ButtonAction = ({ formData, onFieldChange }) => {
  const buttonActionOptions = [
    {
      value: "ba-url-redirect",
      label: __("URL Redirect", "storegrowth-sales-booster"),
    },
    {
      value: "ba-close",
      label: __("Banner Close", "storegrowth-sales-booster"),
    },
  ];

  return (
    <EmptyField
      title={__("Button Action", "storegrowth-sales-booster")}
      tooltip={__("Actions of the button", "storegrowth-sales-booster")}
      colSpan={24}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "10px",
        }}
      >
        <Select
          value={formData.button_action}
          options={buttonActionOptions}
          onChange={(event) => onFieldChange("button_action", event)}
        />
        {formData.button_action === "ba-url-redirect" && (
          <>
            <Input
              value={formData.redirect_url}
              style={{
                padding: "5px",
                border: "1px solid #DDE6F9",
              }}
              onChange={(event) =>
                onFieldChange("redirect_url", event.target.value)
              }
              placeholder="http://example.com"
            />
            {applyFilters(
              "sgsb_floating_notification_bar_button_redirection",
              "",
              formData,
              onFieldChange
            )}
          </>
        )}
      </div>
    </EmptyField>
  );
};

export default ButtonAction;
