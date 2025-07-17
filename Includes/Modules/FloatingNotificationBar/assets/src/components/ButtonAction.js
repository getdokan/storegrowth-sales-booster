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

  const isValidUrl = (url) => {
    // Trim whitespace from input
    if (!url || typeof url !== "string") return false;
    const trimmed = url.trim();

    // Basic pattern: must contain at least one dot and no spaces
    const urlPattern = /^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(:\d+)?(\/.*)?$/;

    return urlPattern.test(trimmed);
  };

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
                onFieldChange("redirect_url", event.target.value, isValidUrl(formData.redirect_url))
              }
              placeholder="http://example.com"
            />
            {!isValidUrl(formData.redirect_url) && (
              <div style={{ color: "red" }}>
                  { __( 'Please enter a valid URL', 'storegrowth-sales-booster' ) }
              </div>
            )}
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
