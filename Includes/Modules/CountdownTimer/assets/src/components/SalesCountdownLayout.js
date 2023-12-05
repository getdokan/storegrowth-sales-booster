import { Fragment } from "react";
import { __ } from "@wordpress/i18n";
import { notification } from "antd";
import { useEffect, useState } from "@wordpress/element";
import { useDispatch } from "@wordpress/data";
import GeneralSettingTab from "./GeneralSettingTab";
import DesignTab from "./DesignTab";
import Preview from "./Preview";

import PanelHeader from "../../../../../../assets/src/components/settings/Panels/PanelHeader";
import PanelContainer from "../../../../../../assets/src/components/settings/Panels/PanelContainer";
import PanelRow from "../../../../../../assets/src/components/settings/Panels/PanelRow";
import PanelPreview from "../../../../../../assets/src/components/settings/Panels/PanelPreview";
import PanelSettings from "../../../../../../assets/src/components/settings/Panels/PanelSettings";

import Layout1 from "../../images/layout/layout-1.svg";
import Layout2 from "../../images/layout/layout-2.svg";
import Custom from "../../images/layout/custom.svg";
import "../styles/countdown-timer.css";
import TouchPreview from "sales-booster/src/components/settings/Panels/TouchPreview";

function SalesCountdownLayout({ navigate, useSearchParams }) {
  const isProEnabled = sgsbAdmin.isPro;
  const { setPageLoading } = useDispatch("sgsb");
  const [buttonLoading, setButtonLoading] = useState(false);
  let [searchParams, setSearchParams] = useSearchParams("general");
  const tabName = searchParams.get("tab_name") || "general";
  const options = [
    {
      theme: "ct-custom",
      label: "ct-custom",
      svg: Custom,
    },
    {
      theme: "ct-layout-1",
      label: "ct-layout-1",
      svg: Layout1,
    },
    {
      theme: "ct-layout-2",
      label: "ct-layout-2",
      svg: Layout2,
    },
  ];
  const initialSalesCountdownData = {
    border_color                  : '#1677FF',
    selected_theme                : 'ct-layout-1',
    countdown_heading             : '[discount]% OFF',
    heading_text_color            : '#008dff',
    widget_background_color       : '#ffffff',
    shop_page_countdown_enable    : false,
    product_page_countdown_enable : true,
  };

  const [formData, setFormData] = useState({
    ...initialSalesCountdownData,
  });

  const onFormReset = () => {
    setFormData({ ...initialSalesCountdownData });
  };

  const changeTab = (key) => {
    navigate("/countdown-timer?tab_name=" + key);
  };

  const notificationMessage = (type) => {
    if (type == "general_settings") {
      notification["success"]({
        message: "Settings Section",
        description: "General settings section data updated successfully.",
      });
    }

    if (type == "design") {
      notification["success"]({
        message: "Design Section",
        description: "Design section data updated successfully.",
      });
    }
  };

  const onFormSave = (type) => {
    setButtonLoading(true);

    let data = {
      action: "sgsb_countdown_timer_save_settings",
      _ajax_nonce: sgsbAdmin.nonce,
      form_data: formData,
    };

    jQuery
      .ajax({
        url: sgsbAdmin.ajax_url,
        method: "POST",
        data: data,
      })
      .success(() => {
        setButtonLoading(false);
        notificationMessage(type);
      });
  };

  const getSettings = () => {
    setPageLoading(true);

    jQuery
      .ajax({
        url: sgsbAdmin.ajax_url,
        method: "POST",
        data: {
          action: "sgsb_countdown_timer_get_settings",
          _ajax_nonce: sgsbAdmin.nonce,
        },
      })
      .success((response) => {
        if (response.success) {
          setFormData({ ...formData, ...response.data });
          setTimeout(() => setPageLoading(false), 500);
        }
      });
  };

  useEffect(() => {
    getSettings();
  }, []);

  const handleSelect = (theme) => {
    onFieldChange("selected_theme", theme);
  };

  const onFieldChange = (key, value) => {
    setFormData({ ...formData, [key]: value });
  };

  const noop = () => {};
  const excludeTabs = [];
  const showPreview = !excludeTabs?.includes(tabName);

  const fontUrl = 'https://fonts.googleapis.com/css2?family=Merienda&display=swap';

  const link = document.createElement( 'link' );
  link.href = fontUrl;
  link.rel = 'stylesheet';

  document.head.appendChild( link );

  const tabPanels = [
    {
      key: "general",
      title: __("Countdown Setting", "storegrowth-sales-booster"),
      panel: (
        <GeneralSettingTab
          formData={formData}
          onFieldChange={onFieldChange}
          onFormSave={() => onFormSave("general_settings")}
          upgradeTeaser={!isProEnabled}
          buttonLoading={buttonLoading}
          onFormReset={onFormReset}
          noop={noop}
        />
      ),
    },
    {
      key: "design",
      title: __("Design", "storegrowth-sales-booster"),
      panel: (
        <DesignTab
          formData={ formData }
          setFormData={ setFormData }
          onFieldChange={ onFieldChange }
          onFormSave={ () => onFormSave( 'design' ) }
          upgradeTeaser={ !isProEnabled }
          buttonLoading={ buttonLoading }
          onFormReset={ onFormReset }
          handleSelect={ handleSelect }
          noop={ noop }
          options={ options }
        />
      ),
    },
  ];
  return (
    <Fragment>
      <PanelHeader
        title={__("Sales Countdown Setting", "storegrowth-sales-booster")}
      />
      <PanelContainer>
        <PanelRow>
          <PanelSettings
            colSpan={showPreview && tabName ? 12 : 24}
            tabPanels={tabPanels}
            changeHandler={changeTab}
            activeTab={tabName ? tabName : "general"}
          />
          {showPreview && tabName && (
            <PanelPreview colSpan={12}>
              <Preview formData={ formData } />
            </PanelPreview>
          )}
        </PanelRow>
        {/* Render preview panel for responsive preview. */}
        <TouchPreview>
          <Preview formData={ formData } />
        </TouchPreview>
      </PanelContainer>
    </Fragment>
  );
}

export default SalesCountdownLayout;