import { Fragment } from "react";
import { notification } from "antd";
import { __ } from "@wordpress/i18n";
import { useEffect, useState } from "@wordpress/element";
import { useDispatch } from "@wordpress/data";

import PanelHeader from "sales-booster/src/components/settings/Panels/PanelHeader";
import PanelContainer from "sales-booster/src/components/settings/Panels/PanelContainer";
import PanelRow from "sales-booster/src/components/settings/Panels/PanelRow";
import PanelPreview from "sales-booster/src/components/settings/Panels/PanelPreview";
import PanelSettings from "sales-booster/src/components/settings/Panels/PanelSettings";
import TouchPreview from "sales-booster/src/components/settings/Panels/TouchPreview";
import GeneralSettingsTab from "./GeneralSettingsTab";
import DesignTab from "./DesingTab";
import Preview from "./Preview";
import ButtonSettingsTab from "./ButtonSettingsTab";


function QuickViewLayout({ navigate, useSearchParams, moduleId }) {
  const isProEnabled = sgsbAdmin.isPro;
  const { setPageLoading } = useDispatch("sgsb");
  const [buttonLoading, setButtonLoading] = useState(false);
  let [searchParams, setSearchParams] = useSearchParams("general");
  const tabName = searchParams.get("tab_name") || "general";

  const initalQuickViewData = {
    enable_in_mobile: true,
    enable_zoom_box: false,
    modal_animation_effect: "mfp-3d-unfold",
    button_border_radius: 4,
    enable_product_navigation: false,
    show_title: true,
    show_description: true,
    show_price: true,
    show_image: true,
    show_excerpt: true,
    show_meta: true,
    show_add_to_cart: true,
    button_label: __("Quick View", "storegrowth-sales-booster"),
    button_position: "after_add_to_cart",
    cart_url_redirection: 'legacy-cart-redirection',
    auto_open_fly_cart: false,
    enable_qucik_view_icon: false,
    quick_view_icon: "quick-view-icon-1",
    show_quick_icon: true,
    enable_close_button: true,
    show_view_details_button: false,
    button_color: "#000000",
    button_text_color: "#ffffff",
    modal_background_color: "#ffffff",
    navigation_background: "#000000",
    navigation_text_color: "$ffffff",
  };

  const [formData, setFormData] = useState({
    ...initalQuickViewData,
  });

  const onFormReset = () => {
    setFormData({ ...initalQuickViewData });
  };

  const changeTab = (key) => {
    navigate("/quick-view?tab_name=" + key);
  };

  const notificationMessage = (type) => {
    switch (type) {
      case "general_settings":
        notification["success"]({
          message: "Settings Section",
          description: "General settings section data updated successfully.",
        });
        break;
      case "button_settings":
        notification["success"]({
          message: "Button Settings Section",
          description: "Button settings section data updated successfully.",
        });
        break;
      case "design":
        notification["success"]({
          message: "Design Section",
          description: "Design section data updated successfully.",
        });
        break;
      default:
        break;
    }
  };

  const onFormSave = (type) => {
    setButtonLoading(true);

    let data = {
      action: "sgsb_quick_view_save_settings",
      _ajax_nonce: sgsbAdmin?.nonce,
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
        url: sgsbAdmin?.ajax_url,
        method: "POST",
        data: {
          action: "sgsb_quick_view_get_settings",
          _ajax_nonce: sgsbAdmin?.nonce,
        },
      })
      .success((response) => {
        if (response?.success) {
          setFormData({ ...formData, ...response?.data });
          setTimeout(() => setPageLoading(false), 500);
        }
      });
  };

  useEffect(() => {
    getSettings();
  }, []);

  const onFieldChange = (key, value) => {
    setFormData({ ...formData, [key]: value });
  };

  const noop = () => { };
  const excludeTabs = [""];
  const showPreview = !excludeTabs?.includes(tabName);

  const tabPanels = [
    {
      key: "general",
      title: __("General Setting", "storegrowth-sales-booster"),
      panel: (
        <GeneralSettingsTab
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
      key: "button-settings",
      title: __("Button Settings", "storegrowth-sales-booster"),
      panel: (
        <ButtonSettingsTab
          formData={formData}
          setFormData={setFormData}
          onFieldChange={onFieldChange}
          onFormSave={() => onFormSave("button_settings")}
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
          formData={formData}
          setFormData={setFormData}
          onFieldChange={onFieldChange}
          onFormSave={() => onFormSave("design")}
          upgradeTeaser={!isProEnabled}
          buttonLoading={buttonLoading}
          onFormReset={onFormReset}
          noop={noop}
        />
      ),
    },
  ];

  return (
    <Fragment>
      <PanelHeader
        title={__("Quick View Setting", "storegrowth-sales-booster")}
        moduleId={moduleId}
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
              <Preview formData={formData} />
            </PanelPreview>
          )}
        </PanelRow>
        {/* Render preview panel for responsive preview. */}
        <TouchPreview previewWidth={350}>
          <Preview formData={formData} />
        </TouchPreview>
      </PanelContainer>
    </Fragment>
  );
}

export default QuickViewLayout;
