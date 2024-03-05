import { notification } from "antd";
import { __ } from "@wordpress/i18n";
import { useEffect, useState } from "@wordpress/element";
import { useDispatch } from "@wordpress/data";
import { Fragment } from "react";
import SettingsTab from "./SettingsTab";
import DesignTab from "./DesignTab";
import Preview from "./Preview";

import PanelHeader from "../../../../../../assets/src/components/settings/Panels/PanelHeader";
import PanelContainer from "../../../../../../assets/src/components/settings/Panels/PanelContainer";
import PanelRow from "../../../../../../assets/src/components/settings/Panels/PanelRow";
import PanelPreview from "../../../../../../assets/src/components/settings/Panels/PanelPreview";
import PanelSettings from "../../../../../../assets/src/components/settings/Panels/PanelSettings";
import TouchPreview from "sales-booster/src/components/settings/Panels/TouchPreview";

function FreeShippingBarLayout({
  outlet: Outlet,
  navigate,
  useSearchParams,
  moduleId,
}) {
  const { setPageLoading } = useDispatch("sgsb");
  const [buttonLoading, setButtonLoading] = useState(false);

  let [searchParams, setSearchParams] = useSearchParams("general");
  const tabName = searchParams.get("tab_name") || "general";
  const initialShipData = {
    btn_text                       : 'Cart',
    bar_type                       : "normal",
    user_type                      : "both",
    font_size                      : 20,
    btn_style                      : true,
    btn_color                      : "#ffffff",
    text_color                     : "#ffffff",
    icon_color                     : "#ffffff",
    btn_target                     : sgsbFsbData?.cartUrl,
    font_family                    : "poppins",
    banner_delay                   : 7,
    bar_position                   : "top",
    bar_template                   : 'shipping_bar_one',
    discount_type                  : "free-shipping",
    banner_height                  : 60,
    btn_text_color                 : "#073b4c",
    banner_trigger                 : "after-few-seconds",
    close_icon_color               : "#ffffff",
    background_color               : "#0875FF",
    banner_device_view             : ["banner-show-desktop"],
    banner_show_option             : "banner-show-everywhere",
    scroll_banner_delay            : 7,
    cart_minimum_amount            : 10,
    slected_page_option            : [],
    goal_completion_text           : "You have successfully acquired free Shipping.",
    discount_amount_mode           : "fixed-amount",
    discount_amount_value          : "",
    progressive_banner_text        : "Add more [amount] to get FREE SHIPPING.",
    progressive_banner_icon_name   : 'shipping-bar-icon-1',
    progressive_banner_custom_icon : '',
  };

  const [formData, setFormData] = useState({ ...initialShipData });

  const onFormReset = () => {
    setFormData({ ...initialShipData });
    setShowUndo( false );
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
          setUndoData({ ...undoData, ...response.data });
          setTimeout(() => setPageLoading(false), 500);
        }
      });
  };

  useEffect(() => {
    getSettings();
  }, []);

  const [ isValidUrl, setIsValidUrl ] = useState( true );

  const validateURL = ( input ) => {
    const pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
      '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
      '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
      '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
      '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
      '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
    return !!pattern.test( input );
  };

  const [showUndo, setShowUndo] = useState({
    btn_color        : false,
    text_color       : false,
    icon_color       : false,
    btn_text_color   : false,
    close_icon_color : false,
    background_color : false,
  });

  const [undoData, setUndoData] = useState({
    ...initialShipData,
  });

  const colorKeyStack = [
    'btn_color',
    'text_color',
    'icon_color',
    'btn_text_color',
    'close_icon_color',
    'background_color'
  ];

  const onFieldChange = (key, value) => {
    if ( key === 'btn_target' ) {
      setIsValidUrl( validateURL( value ) );
    }

    setFormData({
      ...formData,
      [key]: value,
    });

    if ( colorKeyStack?.includes( key ) ) {
      setShowUndo({ ...showUndo, [key]: true });
    }
  };

  const onUndoClick = ( key ) => {
    if ( colorKeyStack?.includes( key ) ) {
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
        setShowUndo(false);
        setButtonLoading(false);
        notificationMessage(type);
        setUndoData({ ...formData });
      });
  };

  const tabPanels = [
    {
      key: "general",
      title: __("Banner Setting", "storegrowth-sales-booster"),
      panel: (
        <SettingsTab
          formData={formData}
          isValid={isValidUrl}
          setFormData={setFormData}
          setShowUndo={setShowUndo}
          onFieldChange={onFieldChange}
          onFormSave={() => onFormSave("banner_settings")}
          buttonLoading={buttonLoading}
          onFormReset={onFormReset}
        />
      ),
    },
    {
      key: "design",
      title: __("Design", "storegrowth-sales-booster"),
      panel: (
        <DesignTab
          showUndoIcon={showUndo}
          undoHandler={onUndoClick}
          formData={formData}
          isValid={isValidUrl}
          setFormData={setFormData}
          onFieldChange={onFieldChange}
          onFormSave={() => onFormSave("design")}
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
        title={__("Free Shipping Rules Setting", "storegrowth-sales-booster")}
        moduleId={moduleId}
      />
      <PanelContainer>
        <PanelRow>
          <PanelSettings
            tabPanels={tabPanels}
            showUndoIcon={showUndo}
            undoHandler={onUndoClick}
            changeHandler={changeTab}
            activeTab={tabName ? tabName : "general"}
            colSpan={showPreview && tabName ? 12 : 24}
          />
          {showPreview && tabName && (
            <PanelPreview colSpan={12}>
              <Preview
                isProActive={isProEnabled}
                formData={formData}
                fontFamily={fontFamily}
              />
            </PanelPreview>
          )}
        </PanelRow>
        {/* Render preview panel for responsive preview. */}
        <TouchPreview previewWidth={550}>
          <Preview
            isProActive={isProEnabled}
            formData={formData}
            fontFamily={fontFamily}
          />
        </TouchPreview>
      </PanelContainer>
    </Fragment>
  );
}

export default FreeShippingBarLayout;
