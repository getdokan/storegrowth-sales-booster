import { notification } from "antd";

import { __ } from "@wordpress/i18n";
import { useDispatch } from "@wordpress/data";
import DesignSettings from "./DesignSettings";
import GeneralSettings from "./GeneralSettings";
import { useEffect, useState } from "@wordpress/element";
import PanelHeader from "sales-booster/src/components/settings/Panels/PanelHeader";
import PanelContainer from "sales-booster/src/components/settings/Panels/PanelContainer";
import PanelRow from "sales-booster/src/components/settings/Panels/PanelRow";
import PanelSettings from "sales-booster/src/components/settings/Panels/PanelSettings";
import PanelPreview from "sales-booster/src/components/settings/Panels/PanelPreview";

import { Fragment } from "react";
import Preview from "./Preview";
import TouchPreview from "sales-booster/src/components/settings/Panels/TouchPreview";

function FlyCart({ navigate, useSearchParams, moduleId }) {
  const { setPageLoading } = useDispatch("sgsb");
  const [buttonLoading, setButtonLoading] = useState(false);

  const quickCartState = {
    layout: "side",
    icon_name: "shopping-cart-icon-5",
    icon_color: "#FFF",
    show_coupon: true,
    icon_position: "bottom-right",
    widget_bg_color: "#FFFFFF",
    product_card_bg_color: "#FFFFFF",
    buttons_bg_color: "#0875FF",
    show_remove_icon: true,
    show_product_image: true,
    show_product_price: true,
    show_quantity_picker: true,
    shopping_button_bg_color: "#073B4C",
    enable_add_to_cart_redirect: true,
  };

  const [formData, updateFormData] = useState({ ...quickCartState });

  const getSettings = () => {
    setPageLoading(true);

    jQuery
      .ajax({
        url: sgsbAdmin.ajax_url,
        method: "POST",
        data: {
          action: "sgsb_fly_cart_get_settings",
          _ajax_nonce: sgsbAdmin.nonce,
        },
      })
      .success((response) => {
        if (response.success) {
          updateFormData({ ...formData, ...response.data });
          setTimeout(() => initializeColorPicker(), 10);
          setTimeout(() => setPageLoading(false), 500);
        }
      });
  };

  useEffect(() => {
    getSettings();
  }, []);

  const initializeColorPicker = () => {
    jQuery(".sgsb-flycart-color-picker").wpColorPicker({
      change(event, ui) {
        // Not sure why it is needed, But it is required to work properly.;
        const fieldName = event.target.name;
        let fieldValue = ui.color.toString();

        updateFormData((prevFormData) => ({
          ...prevFormData,
          [fieldName]: fieldValue,
        }));
      },
    });
  };

  const onFieldChange = (key, value) => {
    updateFormData({
      ...formData,
      [key]: value,
    });
  };

  const notificationMessage = (type) => {
    if (type == "general_settings") {
      notification["success"]({
        message: "General Settings Section",
        description: "General section settings data updated successfully.",
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
      action: "sgsb_fly_cart_save_settings",
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

  let tabColorPickerActivated = false;
  let [searchParams, setSearchParams] = useSearchParams();
  const onTabChange = (activeKey) => {
    if (activeKey != "1" && !tabColorPickerActivated) {
      tabColorPickerActivated = true;
      setTimeout(() => initializeColorPicker(), 10);
    }
  };

  const tabName = searchParams.get("tab_name");
  const changeTab = (key) => {
    navigate("/fly-cart?tab_name=" + key);
  };

  const onFormReset = () => {
    updateFormData({ ...quickCartState });
  };

  const tabPanels = [
    {
      key: "general",
      title: __("General Setting", "storegrowth-sales-booster"),
      panel: (
        <GeneralSettings
          formData={formData}
          onFormSave={onFormSave}
          buttonLoading={buttonLoading}
          onFieldChange={onFieldChange}
          onFormReset={onFormReset}
        />
      ),
    },
    {
      key: "design",
      title: __("Design", "storegrowth-sales-booster"),
      panel: (
        <DesignSettings
          formData={formData}
          onFormSave={() => onFormSave("design")}
          onFieldChange={onFieldChange}
          buttonLoading={buttonLoading}
          onFormReset={onFormReset}
        />
      ),
    },
  ];

  return (
    <Fragment>
      <PanelHeader
        title={__("Fly Cart Setting", "storegrowth-sales-booster")}
        moduleId={moduleId}
      />
      <PanelContainer>
        <PanelRow>
          <PanelSettings
            colSpan={12}
            tabPanels={tabPanels}
            changeHandler={changeTab}
            activeTab={tabName ? tabName : "general"}
          />
          <PanelPreview colSpan={12}>
            <Preview storeData={formData} />
          </PanelPreview>
        </PanelRow>
        {/* Render preview panel for responsive preview. */}
        <TouchPreview previewWidth={580}>
          <Preview storeData={formData} />
        </TouchPreview>
      </PanelContainer>
    </Fragment>
  );
}

export default FlyCart;
