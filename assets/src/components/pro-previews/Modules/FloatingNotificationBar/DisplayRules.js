import { __ } from "@wordpress/i18n";
import {Fragment} from 'react';
import SettingsSection from "../../../settings/Panels/PanelSettings/SettingsSection";
import SectionHeader from "../../../settings/Panels/SectionHeader";
import CheckboxGroup from "../../../settings/Panels/PanelSettings/Fields/CheckboxGroup";
import BannerTrigger from "sales-booster-floating-notification-bar/src/components/BannerTrigger";
import PageTarget from "sales-booster-floating-notification-bar/src/components/PageTarget";

const DisplayRules = () => {

  const bannerDeviceOption = [
    {
      label: __(`Desktop`,"storegrowth-sales-booster"),
      value: "banner-show-desktop",
      needUpgrade: true,
    },
    {
      label: __(`Mobile`,"storegrowth-sales-booster"),
      value: "banner-show-mobile",
      needUpgrade: true,
    },
  ];

  return (
    <Fragment>
      <SectionHeader
        title={__("Display Rules", "storegrowth-sales-booster")}
      />
      <SettingsSection>
        {/* Device selection Checkbox group */}
        <CheckboxGroup
          displayDirection={"horizontal"}
          name={"banner_device_view"}
          options={bannerDeviceOption}
          selectedOptions={['banner-show-desktop']}
          title={__("Show Banner", "storegrowth-sales-booster")}
          needUpgrade={true}
          tooltip={__("Banner Dispaly in Devices", "storegrowth_sales_booster")}
          showSingleCheckOverlay={false}
          headColSpan={16}
          checkboxColSpan={8}
          showProIcon={false}
        />
        <BannerTrigger/>
        <PageTarget/>
      </SettingsSection>
    </Fragment>
  );
};

export default DisplayRules;
