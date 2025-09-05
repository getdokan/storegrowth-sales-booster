import { __ } from "@wordpress/i18n";
import { Select } from "antd";
import EmptyField from "sales-booster/src/components/settings/Panels/PanelSettings/Fields/EmptyField";

const PageTarget = () => {
  const bannerPageShowOption = [
    {
      label: __("Show Everywhere", "storegrowth-sales-booster"),
      value: "banner-show-everywhere",
    },
  ];

  const userOption = [
    { value: "both", label: __("Everyone", "storegrowth-sales-booster") },
  ];

  return (
    <EmptyField
      needUpgrade={true}
      title={__("Page Targeting", "storegrowth-sales-booster")}
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
          value={"banner-show-everywhere"}
          style={{
            width: "100%",
          }}
          disabled={true}
          options={bannerPageShowOption}
        />
        <Select
          disabled={true}
          defaultValue={"both"}
          style={{
            width: "100%",
          }}
          options={userOption}
        />
      </div>
    </EmptyField>
  );
};

export default PageTarget;
