import { Fragment } from "react";
import { notification } from "antd";
import { __ } from "@wordpress/i18n";
import { useEffect, useState } from "@wordpress/element";
import { useDispatch } from "@wordpress/data";

import PanelHeader from "../../../../../../assets/src/components/settings/Panels/PanelHeader";
import PanelContainer from "../../../../../../assets/src/components/settings/Panels/PanelContainer";
import PanelRow from "../../../../../../assets/src/components/settings/Panels/PanelRow";
import PanelPreview from "../../../../../../assets/src/components/settings/Panels/PanelPreview";
import PanelSettings from "../../../../../../assets/src/components/settings/Panels/PanelSettings";
import GeneralSettingsTab from "./GeneralSettingsTab";
import DesignTab from "./DesingTab";
import Preview from "./Preview";
import TouchPreview from "sales-booster/src/components/settings/Panels/TouchPreview";

function StockBarLayout({ navigate, useSearchParams ,moduleId}) {
  const isProEnabled = sgsbAdmin.isPro;
  const { setPageLoading } = useDispatch("sgsb");
  const [buttonLoading, setButtonLoading] = useState(false);
  let [searchParams, setSearchParams] = useSearchParams("general");
  const tabName = searchParams.get("tab_name") || "general";

  const initalStockBarData = {
    stockbar_height                 : 10,
    show_stock_status               : true,
    stock_status_text               : __( 'Hurry! only {quantity} stocks left.', 'storegrowth-sales-booster' ),
    status_text_color               : '#073B4C',
    stockbar_bg_color               : "#EBF6FF",
    stockbar_fg_color               : "#008DFF",
    stockbar_template               : 'stock_bar_one',
    stock_display_format            : 'above',
    stockbar_border_color           : '#DDE6F9',
    total_sell_count_text           : __( 'Total Sold', 'storegrowth-sales-booster' ),
    status_quantity_required        : 10,
    available_item_count_text       : __( 'Available Item', 'storegrowth-sales-booster' ),
    shop_page_stock_bar_enable      : false,
    shop_page_countdown_enable      : false,
    product_page_stock_bar_enable   : true,
    product_page_countdown_enable   : true,
    variation_page_stock_bar_enable : false,
  };
  const [formData, setFormData] = useState({
    ...initalStockBarData,
  });

  const onFormReset = () => {
    setFormData({ ...initalStockBarData });
  };

  const changeTab = (key) => {
    navigate("/stock-bar?tab_name=" + key);
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
      action: "sgsb_stock_bar_save_settings",
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
          action: "sgsb_stock_bar_get_settings",
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

  const onFieldChange = (key, value) => {
    setFormData({ ...formData, [key]: value });
  };

  const noop = () => {};
  const excludeTabs = ["general"];
  const showPreview = !excludeTabs?.includes(tabName);

  const tabPanels = [
    {
      key: "general",
      title: __("Stock Bar Setting", "storegrowth-sales-booster"),
      panel: (
        <GeneralSettingsTab
          formData={ formData }
          onFieldChange={ onFieldChange }
          onFormSave={ () => onFormSave( 'general_settings' ) }
          upgradeTeaser={ !isProEnabled }
          buttonLoading={ buttonLoading }
          onFormReset={ onFormReset }
          noop={ noop }
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
          onFormSave={ () => onFormSave( "design" ) }
          upgradeTeaser={ !isProEnabled }
          buttonLoading={ buttonLoading }
          onFormReset={ onFormReset }
          noop={ noop }
        />
      ),
    },
  ];

  return (
    <Fragment>
      <PanelHeader
        title={__("Stock Bar Setting", "storegrowth-sales-booster")}
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
              <Preview formData={ formData } />
            </PanelPreview>
          )}
        </PanelRow>
        {/* Render preview panel for responsive preview. */}
        <TouchPreview previewWidth={ 350 }>
          <Preview formData={ formData } />
        </TouchPreview>
      </PanelContainer>
    </Fragment>
  );
}

export default StockBarLayout;
