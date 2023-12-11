import { Select, Input, Checkbox } from "antd";
import { __ } from "@wordpress/i18n";
import EmptyField from "../../../../../../assets/src/components/settings/Panels/PanelSettings/Fields/EmptyField";
import UpgradeOverlay from "../../../../../../assets/src/components/settings/Panels/PanelSettings/UpgradeOverlay";
import UpgradeCrown from "sales-booster/src/components/settings/Panels/PanelSettings/UpgradeCrown";

const ButtonAction = () => {
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
          <label className={ `${ upgradeTeaser ? 'single-disabled-checkbox' : '' }` }>
          <Checkbox
            disabled={upgradeTeaser}
            value={"new_tab_enable"}
            checked={formData.new_tab_enable}
            onChange={
              upgradeTeaser
                ? noop
                : (event) =>
                    onFieldChange("new_tab_enable", event.target.checked)
            }
          >
            <div style={{ display: "flex", gap: "10px" }}>
              Open in New Tab
              {upgradeTeaser && <UpgradeCrown />}
            </div>
          </Checkbox>
          { upgradeTeaser && <UpgradeOverlay /> }
        </label>
        </>
      )}
    </div>
  </EmptyField>
  )
}

export default ButtonAction
