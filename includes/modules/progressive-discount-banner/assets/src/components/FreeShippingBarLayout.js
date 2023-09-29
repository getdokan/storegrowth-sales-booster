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
  const initialShipData = {
      bar_type                     : "normal",
      user_type                    : "both",
      font_size                    : 20,
      text_color                   : "#ffffff",
      icon_color                   : "#ffffff",
      font_family                  : "poppins",
      banner_delay                 : 7,
      bar_position                 : "top",
      discount_type                : "free-shipping",
      banner_height                : 60,
      banner_trigger               : "after-few-seconds",
      background_color             : "#0875FF",
      banner_device_view           : ["banner-show-desktop"],
      banner_show_option           : "banner-show-everywhere",
      scroll_banner_delay          : 7,
      cart_minimum_amount          : 10,
      slected_page_option          : [],
      goal_completion_text         : "You have successfully acquired free Shipping.",
      discount_amount_mode         : "fixed-amount",
      discount_amount_value        : "",
      progressive_banner_text      : "Add more [amount] to get FREE SHIPPING.",
      progressive_banner_icon_name : "",
      progressive_banner_icon_html : "",
  };

  const [formData, setFormData] = useState({ ...initialShipData });

  const onFormReset = () => {
    setFormData({ ...initialShipData });
  };

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
      [html_name]: value ? renderToString(iconHtml) : value,
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
          onFormReset={onFormReset}
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
          onFormReset={onFormReset}
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
