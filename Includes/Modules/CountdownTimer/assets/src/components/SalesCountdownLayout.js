import { Fragment } from "react";
import { __ } from "@wordpress/i18n";
import { notification } from "antd";
import { useEffect, useState } from "@wordpress/element";
import { useDispatch } from "@wordpress/data";
import GeneralSettingTab from "./GeneralSettingTab";
import ShortCodeGenerator from "./ShortCodeGenerator";
import Preview from "./Preview";
import GenPreview from "./GeneratorPreview/GenPreview";

import PanelContainer from "../../../../../../assets/src/components/settings/Panels/PanelContainer";
import PanelRow from "../../../../../../assets/src/components/settings/Panels/PanelRow";
import PanelPreview from "../../../../../../assets/src/components/settings/Panels/PanelPreview";
import PanelSettings from "../../../../../../assets/src/components/settings/Panels/PanelSettings";

import Layout1 from "../../images/layout/layout-1.svg";
import Layout2 from "../../images/layout/layout-2.svg";
import Custom from "../../images/layout/custom.svg";
// import "../styles/countdown-timer.css";
import TouchPreview from "sales-booster/src/components/settings/Panels/TouchPreview";
import CountdownList from "./CountdownList";

function SalesCountdownLayout({ navigate, useSearchParams, moduleId }) {
  const isProEnabled = sgsbAdmin.isPro;
  const { setPageLoading } = useDispatch("sgsb");
  const [buttonLoading, setButtonLoading] = useState(false);
  let [searchParams, setSearchParams] = useSearchParams("general");
  const tabName = searchParams.get("tab_name") || "general";
  const isTabCodeGen = searchParams.get("tab_name") === "short_code";

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
    font_family: "roboto",
    border_color: "#1677FF",
    day_text_color: "#1B1B50",
    selected_theme: "ct-layout-1",
    hour_text_color: "#1B1B50",
    minute_text_color: "#1B1B50",
    second_text_color: "#1B1B50",
    countdown_heading: "[discount]% OFF",
    heading_text_color: "#008DFF",
    counter_border_color: "#ECEDF0",
    widget_background_color: "#FFFFFF",
    counter_background_color: "#FFFFFF",
    shop_page_countdown_enable: false,
    product_page_countdown_enable: true,
    enable_ct_block: false,
  };

  const countShortFormData = {
    countdown_heading: "Discount Off",
    countdown_start_date: "",
    countdown_end_date: "",
    selected_theme: "ct-layout-1",
    ...initialSalesCountdownData,
  };

  const [shortCodeState, setShortCodeState] = useState({
    ...countShortFormData,
  });

  const [formData, setFormData] = useState({
    ...initialSalesCountdownData,
  });
  const [undoData, setUndoData] = useState({
    ...initialSalesCountdownData,
  });

  const undoState = {
    border_color: false,
    day_text_color: false,
    hour_text_color: false,
    minute_text_color: false,
    second_text_color: false,
    counter_border_color: false,
    heading_text_color: false,
    widget_background_color: false,
    counter_background_color: false,
  };

  const onFormReset = () => {
    setFormData({ ...initialSalesCountdownData });
    setShowUndo({ ...undoState });
  };

  const changeTab = (key) => {
    navigate("/countdown-timer?tab_name=" + key);
  };

  const [showUndo, setShowUndo] = useState({ ...undoState });

  const colorKeyStack = [
    "border_color",
    "day_text_color",
    "hour_text_color",
    "minute_text_color",
    "second_text_color",
    "heading_text_color",
    "counter_border_color",
    "widget_background_color",
    "counter_background_color",
  ];

  const onFieldChange = (key, value) => {
    setFormData({ ...formData, [key]: value });
    if (colorKeyStack?.includes(key)) {
      setShowUndo({ ...showUndo, [key]: true });
    }
  };

  const shortCodeFieldChanger = (key, value) => {
    setShortCodeState({ ...shortCodeState, [key]: value });
  };

  const onUndoClick = (key) => {
    if (colorKeyStack?.includes(key)) {
      setShowUndo({
        ...showUndo,
        [key]: false,
      });
      setFormData({
        ...formData,
        [key]: undoData?.[key],
      });
    }
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
        setShowUndo(false);
        setButtonLoading(false);
        notificationMessage(type);
        setUndoData({ ...formData });
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
          setUndoData({ ...undoData, ...response.data });
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

  const noop = () => {};
  const excludeTabs = ["countdown_list", "general"];
  const showPreview = !excludeTabs?.includes(tabName);

  const fontUrl =
    "https://fonts.googleapis.com/css2?family=Merienda&display=swap";

  const link = document.createElement("link");
  link.href = fontUrl;
  link.rel = "stylesheet";

  document.head.appendChild(link);

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
      key: "countdown_list",
      title: __("Countdown Timer List", "storegrowth-sales-booster"),
      panel: <CountdownList />,
    },
    {
      key: "short_code",
      title: __("Short Code Generator", "storegrowth-sales-booster"),
      panel: (
        <ShortCodeGenerator
          formData={shortCodeState}
          setFormData={setShortCodeState}
          onFieldChange={shortCodeFieldChanger}
          onFormSave={() => onFormSave("design")}
          upgradeTeaser={!isProEnabled}
          buttonLoading={buttonLoading}
          onFormReset={onFormReset}
          handleSelect={handleSelect}
          noop={noop}
          options={options}
        />
      ),
    },
  ];
  return (
    <Fragment>
      <PanelContainer>
        <PanelRow>
          <PanelSettings
            tabPanels={tabPanels}
            changeHandler={changeTab}
            activeTab={tabName ? tabName : "general"}
            colSpan={showPreview && tabName ? 12 : 24}
          />
          {showPreview && tabName && (
            <PanelPreview colSpan={12}>
              {isTabCodeGen ? (
                <GenPreview formData={shortCodeState} />
              ) : (
                <Preview formData={formData} />
              )}
            </PanelPreview>
          )}
        </PanelRow>
        {/* Render preview panel for responsive preview. */}
        <TouchPreview>
          <Preview formData={formData} />
        </TouchPreview>
      </PanelContainer>
    </Fragment>
  );
}

export default SalesCountdownLayout;
