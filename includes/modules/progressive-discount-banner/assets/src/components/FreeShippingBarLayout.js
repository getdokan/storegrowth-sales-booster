import { Tabs, notification } from "antd";
import { __ } from "@wordpress/i18n";
import {
  useEffect,
  useState,
  renderToString,
  createElement,
} from "@wordpress/element";
import { useDispatch } from "@wordpress/data";
import { IconPickerItem } from "react-fa-icon-picker";
import { Fragment } from "react";
import SettingsTab from "./SettingsTab";
import DesignTab from "./DesignTab";
import Preview from "./Preview";

import PanelHeader from "../../../../../../assets/src/components/settings/Panels/PanelHeader";
import PanelContainer from "../../../../../../assets/src/components/settings/Panels/PanelContainer";
import PanelRow from "../../../../../../assets/src/components/settings/Panels/PanelRow";
import PanelPreview from "../../../../../../assets/src/components/settings/Panels/PanelPreview";
import PanelSettings from "../../../../../../assets/src/components/settings/Panels/PanelSettings";

function FreeShippingBarLayout({ outlet: Outlet, navigate, useSearchParams }) {
  const { setPageLoading } = useDispatch("sgsb");
  const [buttonLoading, setButtonLoading] = useState(false);

  let [searchParams, setSearchParams] = useSearchParams("general");
  const tabName = searchParams.get("tab_name") || "general";

  const [formData, setFormData] = useState({
    discount_type: "free-shipping",
    discount_amount_mode: "fixed-amount",
    discount_amount_value: "",
    cart_minimum_amount: "",
    progressive_banner_text: "",
    goal_completion_text: "",
    bar_position: "top",
    bar_type: "normal",
    background_color: "#008DFF",
    text_color: "#ffffff",
    icon_color: "#ffffff",
    progressive_banner_icon_name: "",
    progressive_banner_icon_html: "",
    banner_device_view: [],
    banner_show_option: "banner-show-everywhere",
    slected_page_option: [],
    user_type: "both",
    banner_trigger: "after-few-seconds",
    banner_delay: 7,
    scroll_banner_delay: 7,
    banner_height: 60,
    font_family: "poppins",
    font_size: 20,
  });

  const fontFamily = [
    {
      value: "poppins",
      label: __("Poppins", "storegrowth-sales-booster"),
    },
    {
      value: "roboto",
      label: __("Roboto", "storegrowth-sales-booster"),
    },
    {
      value: "lato",
      label: __("Lato", "storegrowth-sales-booster"),
    },
    {
      value: "montserrat",
      label: __("Montserrat", "storegrowth-sales-booster"),
    },
    {
      value: "ibm_plex_sans",
      label: __("IBM Plex Sans", "storegrowth-sales-booster"),
    },
  ];

  const isProEnabled = sgsbAdmin.isPro;

  const getSettings = () => {
    setPageLoading(true);

    jQuery
      .ajax({
        url: sgsbAdmin.ajax_url,
        method: "POST",
        data: {
          action: "sgsb_pd_banner_get_settings",
          _ajax_nonce: sgsbAdmin.nonce,
        },
      })
      .success((response) => {
        if (response.success && response.data) {
          setFormData({ ...formData, ...response.data });
          setTimeout(() => setPageLoading(false), 500);
        }
      });
  };

  useEffect(() => {
    getSettings();
  }, []);

  const onFieldChange = (key, value) => {
    setFormData({
      ...formData,
      [key]: value,
    });
  };
  const changeTab = (key) => {
    navigate("/progressive-discount-banner?tab_name=" + key);
  };

  const notificationMessage = (type) => {
    if (type == "banner_settings") {
      notification["success"]({
        message: "Banner Settings Section",
        description: "Banner settings section data updated successfully.",
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

    const data = {
      action: "sgsb_pd_banner_save_settings",
      _ajax_nonce: sgsbAdmin.nonce,
      form_data: JSON.stringify({ shipping_bar_data: formData }),
    };

    jQuery
      .ajax({
        url: sgsbAdmin.ajax_url,
        method: "POST",
        data,
      })
      .success(() => {
        setButtonLoading(false);
        notificationMessage(type);
      });
  };

  const onIconChange = (icon_name, html_name, value) => {
    let iconHtml = createElement(IconPickerItem, { icon: value });

    setFormData({
      ...formData,
      [icon_name]: value,
      [html_name]: renderToString(iconHtml),
    });
  };

  const tabPanels = [
    {
      key: "general",
      title: __("Banner Setting", "storegrowth-sales-booster"),
      panel: (
        <SettingsTab
          formData={formData}
          onFieldChange={onFieldChange}
          onFormSave={() => onFormSave("banner_settings")}
          buttonLoading={buttonLoading}
          onIconChange={onIconChange}
          upgradeTeaser={!isProEnabled}
        />
      ),
    },
    {
      key: "design",
      title: __("Design", "storegrowth-sales-booster"),
      panel: (
        <DesignTab
          formData={formData}
          onFieldChange={onFieldChange}
          onFormSave={() => onFormSave("design")}
          upgradeTeaser={!isProEnabled}
          buttonLoading={buttonLoading}
          fontFamily={fontFamily}
        />
      ),
    },
  ];
  const excludeTabs = [];
  const showPreview = !excludeTabs?.includes(tabName);
  return (
    <Fragment>
      <PanelHeader
        title={__("Free Shipping Bar Setting", "storegrowth-sales-booster")}
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
              <Preview formData={formData} fontFamily={fontFamily} />
            </PanelPreview>
          )}
        </PanelRow>
      </PanelContainer>
    </Fragment>
  );
}

export default FreeShippingBarLayout;
