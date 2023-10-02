import React from "react";
import { Select } from "antd";
import { __ } from "@wordpress/i18n";
import EmptyField from "sales-booster/src/components/settings/Panels/PanelSettings/Fields/EmptyField";
const VisibilityControl = ({
  title,
  upgradeTeaser,
  formData,
  bannerPageShowOption,
  pageOptions,
  userOption,
  onFieldChange,
  noop
}) => {
  return (
    <div>
      <EmptyField
        needUpgrade={upgradeTeaser}
        title={title}
        tooltip={__(
          `Add page targeting to ensure the welcome bar only appears or doesn't appear for the selected pages only`,
          "storegrowth-sales-booster"
        )}
        colSpan={24}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "10px",
          }}
        >
          {/* Banner Showing Options */}
          <Select
            value={formData.banner_show_option}
            style={{
              width: "100%",
            }}
            disabled={upgradeTeaser}
            options={bannerPageShowOption}
            onChange={
              upgradeTeaser
                ? noop
                : (event) => onFieldChange("banner_show_option", event)
            }
          />
          {formData.banner_show_option === "banner-show-selected" && (
            <>
              {/* Banner Showing page lists */}
              <Select
                disabled={upgradeTeaser}
                mode="multiple"
                defaultValue={formData.slected_page_option}
                style={{
                  width: "100%",
                }}
                options={pageOptions}
                onChange={
                  upgradeTeaser
                    ? noop
                    : (event) => onFieldChange("slected_page_option", event)
                }
              />
            </>
          )}
          {/* User types that will be availabel to seee the pages */}
          <Select
            disabled={upgradeTeaser}
            defaultValue={formData.user_type}
            style={{
              width: "100%",
            }}
            options={userOption}
            onChange={
              upgradeTeaser
                ? noop
                : (event) => onFieldChange("user_type", event)
            }
          />
        </div>
      </EmptyField>
    </div>
  );
};

export default VisibilityControl;
