import { Fragment } from 'react';
import { __ } from "@wordpress/i18n";
import { notification } from "antd";
import { iniBogoGlobalSettings } from "../helper";
import ActionsHandler from "sales-booster/src/components/settings/Panels/PanelSettings/ActionsHandler";
import SettingsSection from 'sales-booster/src/components/settings/Panels/PanelSettings/SettingsSection';
import { SectionSpacer, Switcher, TextAreaBox } from 'sales-booster/src/components/settings/Panels';
import { useSelect, useDispatch } from '@wordpress/data';
import { useEffect, useState } from "@wordpress/element";

const GeneralSettings = () => {
  const [getButtonLoading, setButtonLoading] = useState(false);
  const { setBogoGlobalSettings } = useDispatch("sgsb_bogo");
  const { setPageLoading } = useDispatch("sgsb");

  const { bogoGlobalSettingsData: currentSettings } = useSelect((select) => ({
    bogoGlobalSettingsData: select("sgsb_bogo").getBogoGlobalSettings(),
  }));

  const onFieldChange = (key, value) => {
    setBogoGlobalSettings({
      ...currentSettings,
      [key]: value,
    });
  };

  const onFormReset = () => {
    setBogoGlobalSettings({ ...iniBogoGlobalSettings });
  };

  const notificationMessage = (type) => {
    if (type == "general_settings") {
      notification["success"]({
        message: "General Settings Section",
        description: "General section settings data updated successfully.",
      });
    }
  };

  const onFormSave = (type) => {
    setButtonLoading(true);

    jQuery.post(
      sgsbAdmin.ajax_url,
      {
        action: "sgsb_bogo_general_save_settings",
        data: JSON.stringify({
          bogo_general_settings_data: currentSettings,
        }),
        _ajax_nonce: sgsbAdmin.nonce,
      },
      function (response) {
        setBogoGlobalSettings(response.data);
        setButtonLoading(false);
        notificationMessage(type);
      })
  };

  useEffect(() => {
    setPageLoading(true);
    let $ = jQuery;
    $.post(
      sgsbAdmin.ajax_url,
      {
        action: "sgsb_bogo_general_get_settings",
        data: [],
        _ajax_nonce: sgsbAdmin.nonce,
      },
      function (response) {
        setBogoGlobalSettings({
          ...currentSettings,
          ...response.data,
        });
        setPageLoading(false);
      }
    );
  }, []);

  return (
    <Fragment>
      <SettingsSection>
        <Switcher
          colSpan={12}
          name={'offer_remove_from_cart'}
          changeHandler={onFieldChange}
          title={__('Allow Remove Offer Product', 'storegrowth-sales-booster')}
          isEnable={currentSettings?.offer_remove_from_cart}
          tooltip={__('Allow the customer to remove the offer product from the cart.')}
        />
        <Switcher
          colSpan={12}
          name={'regular_price_show'}
          changeHandler={onFieldChange}
          title={__('Show Regular Price', 'storegrowth-sales-booster')}
          isEnable={currentSettings?.regular_price_show}
          tooltip={__('It will show the offer price along with the regular price.')}
        />
        <Switcher
          colSpan={12}
          name={'shop_page_bage_icon'}
          changeHandler={onFieldChange}
          title={__('Shop Page Badge Icon', 'storegrowth-sales-booster')}
          isEnable={currentSettings?.shop_page_bage_icon}
          tooltip={__('The badge icon will show in the shop page.')}
        />
        <Switcher
          colSpan={12}
          name={'global_product_page_bage_icon'}
          changeHandler={onFieldChange}
          title={__('Product Page Badge Icon', 'storegrowth-sales-booster')}
          isEnable={currentSettings?.global_product_page_bage_icon}
          tooltip={__('The badge icon will show in the product page.')}
        />
        <Switcher
          colSpan={12}
          name={'bogo_category_page_message_enable'}
          changeHandler={onFieldChange}
          title={__('Enable Category Page Message', 'storegrowth-sales-booster')}
          isEnable={currentSettings?.bogo_category_page_message_enable}
          tooltip={__('The badge icon will show in the product page.')}
        />
        {currentSettings?.bogo_category_page_message_enable &&
          (
            <Fragment>
              <SectionSpacer />
              <TextAreaBox
                areaRows={3}
                name={'bogo_product_page_message'}
                fieldValue={currentSettings?.bogo_product_page_message}
                changeHandler={onFieldChange}
                title={__('Category Page Message', 'storegrowth-sales-booster')}
                placeHolderText={__('Enter the text for shop page', 'storegrowth-sales-booster')}
                tooltip={__('example text', 'storegrowth-sales-booster')}
              />
            </Fragment>)
        }

      </SettingsSection>
      <ActionsHandler
        resetHandler={onFormReset}
        loadingHandler={getButtonLoading}
        saveHandler={() => onFormSave('general_settings')}
      />
    </Fragment>
  )
}

export default GeneralSettings
