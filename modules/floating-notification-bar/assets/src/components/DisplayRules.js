import { __ } from "@wordpress/i18n";
import { Select } from "antd";
import SettingsSection from "../../../../../../assets/src/components/settings/Panels/PanelSettings/SettingsSection";
import SectionHeader from "../../../../../../assets/src/components/settings/Panels/SectionHeader";
import CheckboxGroup from "../../../../../../assets/src/components/settings/Panels/PanelSettings/Fields/CheckboxGroup";
import EmptyField from "../../../../../../assets/src/components/settings/Panels/PanelSettings/Fields/EmptyField";
import BannerTrigger from "./BannerTrigger";

const DisplayRules = (props) => {
  const { upgradeTeaser, onFieldChange, formData } = props;
  const noop = () => {};

  const bannerPageShowOption = [
    {
      label: `Show Everywhere`,
      value: "banner-show-everywhere",
    },
    {
      label: `Show on Selected`,
      value: "banner-show-selected",
      tooltip: __("", "storegrowth-sales-booster"),
    },
  ];

  const bannerDeviceOption = [
    {
      label: `Desktop`,
      value: "banner-show-desktop",
      needUpgrade:upgradeTeaser
    },
    {
      label: `Mobile`,
      value: "banner-show-mobile",
      needUpgrade:upgradeTeaser
    },
  ];

  const pageOptions = [
    { value: "is_front_page", label: "Front Page" },
    { value: "is_home", label: "Blog Page" },
    { value: "is_singular", label: "All Post,Pages and Post Types" },
    { value: "is_page", label: "All Post" },
    { value: "is_attachment", label: "All Pages" },
    { value: "is_search", label: "Search Page" },
    { value: "is_404", label: "404 Error Page" },
    { value: "is_archive", label: "All Archives" },
    { value: "is_category", label: "All Category Archives" },
    { value: "is_tag", label: "All Tag Archives" },
  ];

  const userOption = [
    { value: "logged_in", label: "Logged In" },
    { value: "not_logged_in", label: "Not Logged In" },
    { value: "both", label: "Everyone" },
  ];
  return (
    <>
      <SectionHeader
        // showUpgrade={upgradeTeaser}
        title={__(props.textTitle, "storegrowth-sales-booster")}
      />
      <SettingsSection>
        {/* Device selection Checkbox group */}
        <CheckboxGroup
          displayDirection={"horizontal"}
          name={"banner_device_view"}
          options={bannerDeviceOption}
          selectedOptions={formData.banner_device_view}
          handleCheckboxChange={onFieldChange}
          title={__("Show Banner", "storegrowth-sales-booster")}
          needUpgrade={upgradeTeaser}
          tooltip={__("Banner Dispaly in Devices", "storegrowth_sales_booster")}
          headColSpan={16}
          checkboxColSpan={8}
          showProIcon={false}
        />
        <BannerTrigger
          upgradeTeaser={upgradeTeaser}
          onFieldChange={onFieldChange}
          formData={formData}
        />
        {/* Empty Field Component */}
        <EmptyField
          needUpgrade={ upgradeTeaser }
          title={ __( "Page Targeting", "storegrowth-sales-booster" ) }
          tooltip={ __(
            `Add page targeting to ensure the welcome bar only appears or doesn't appear for the selected pages only`,
            "storegrowth-sales-booster"
          ) }
          colSpan={ 24 }
          leftCol={ 12 }
          rightCol={ 12 }
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
              defaultValue={formData.banner_show_option}
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
      </SettingsSection>
    </>
  );
};

export default DisplayRules;
