import { notification } from 'antd';
import { __ } from '@wordpress/i18n';
import {
  useEffect,
  useState,
} from '@wordpress/element';
import { useDispatch } from '@wordpress/data';
import { Fragment } from 'react';
import SettingsTab from './SettingsTab';
import DesignTab from './DesignTab';
import Preview from './Preview';

import PanelHeader from '../../../../../../assets/src/components/settings/Panels/PanelHeader';
import PanelContainer from '../../../../../../assets/src/components/settings/Panels/PanelContainer';
import PanelRow from '../../../../../../assets/src/components/settings/Panels/PanelRow';
import PanelPreview from '../../../../../../assets/src/components/settings/Panels/PanelPreview';
import PanelSettings from '../../../../../../assets/src/components/settings/Panels/PanelSettings';
import TouchPreview from "sales-booster/src/components/settings/Panels/TouchPreview";

function FloatingNotificationBarLayout({
  outlet: Outlet,
  navigate,
  useSearchParams,
  moduleId
}) {
  const { setPageLoading } = useDispatch('sgsb');
  const [buttonLoading, setButtonLoading] = useState(false);

  let [searchParams, setSearchParams] = useSearchParams('general');
  const tabName = searchParams.get('tab_name') || 'general';
  const initialFloatingBarData = {
    bar_type                   : 'normal',
    user_type                  : 'both',
    font_size                  : 20,
    cupon_code                 : '',
    text_color                 : '#ffffff',
    icon_color                 : '#ffffff',
    show_cupon                 : false,
    button_view                : ['button-desktop-enable'],
    font_family                : 'poppins',
    banner_delay               : 7,
    button_color               : '#ffffff',
    bar_position               : 'top',
    redirect_url               : '',
    button_action              : 'ba-close',
    banner_height              : 60,
    banner_trigger             : 'after-few-seconds',
    new_tab_enable             : false,
    ac_button_text             : 'Shop Now',
    notify_template            : 'notify_bar_one',
    close_icon_color           : '#ffffff',
    background_color           : '#0875ff',
    button_text_color          : '#000000',
    banner_show_option         : 'banner-show-everywhere',
    countdown_end_date         : '',
    banner_device_view         : ['banner-show-desktop'],
    scroll_banner_delay        : 7,
    slected_page_option        : [],
    default_banner_text        : 'Shop More Than $100 to get Free Shipping',
    countdown_start_date       : '',
    countdown_show_enable      : false,
    default_banner_icon_name   : 'notify-bar-icon-1',
    default_banner_custom_icon : '',
  };
  const [formData, setFormData] = useState({
    ...initialFloatingBarData,
  });

  const onFormReset = () => {
    setFormData({ ...initialFloatingBarData });
  };

  const fontFamily = [
    {
      value: 'poppins',
      label: __('Poppins', 'storegrowth-sales-booster'),
    },
    {
      value: 'roboto',
      label: __('Roboto', 'storegrowth-sales-booster'),
    },
    {
      value: 'lato',
      label: __('Lato', 'storegrowth-sales-booster'),
    },
    {
      value: 'montserrat',
      label: __('Montserrat', 'storegrowth-sales-booster'),
    },
    {
      value: 'ibm_plex_sans',
      label: __('IBM Plex Sans', 'storegrowth-sales-booster'),
    },
  ];

  const isProEnabled = sgsbAdmin.isPro;

  const getSettings = () => {
    setPageLoading(true);

    jQuery
      .ajax({
        url: sgsbAdmin.ajax_url,
        method: 'POST',
        data: {
          action: 'sgsb_floating_notification_bar_get_settings',
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
    navigate('/floating-notification-bar?tab_name=' + key);
  };

  const notificationMessage = (type) => {
    if (type == 'banner_settings') {
      notification['success']({
        message: 'Banner Settings Section',
        description: 'Banner settings section data updated successfully.',
      });
    }

    if (type == 'design') {
      notification['success']({
        message: 'Design Section',
        description: 'Design section data updated successfully.',
      });
    }
  };

  const onFormSave = (type) => {
    setButtonLoading(true);

    const data = {
      action: 'sgsb_floating_notification_bar_save_settings',
      _ajax_nonce: sgsbAdmin.nonce,
      form_data: JSON.stringify({ shipping_bar_data: formData }),
    };

    jQuery
      .ajax({
        url: sgsbAdmin.ajax_url,
        method: 'POST',
        data,
      })
      .success(() => {
        setButtonLoading(false);
        notificationMessage(type);
      });
  };


  const tabPanels = [
    {
      key: 'general',
      title: __('Banner Setting', 'storegrowth-sales-booster'),
      panel: (
        <SettingsTab
          formData={formData}
          setFormData={setFormData}
          onFieldChange={onFieldChange}
          onFormSave={() => onFormSave('banner_settings')}
          buttonLoading={buttonLoading}
          upgradeTeaser={!isProEnabled}
          onFormReset={onFormReset}
        />
      ),
    },
    {
      key: 'design',
      title: __('Design', 'storegrowth-sales-booster'),
      panel: (
        <DesignTab
          formData={ formData }
          setFormData={ setFormData }
          onFieldChange={ onFieldChange }
          onFormSave={ () => onFormSave( 'design' ) }
          upgradeTeaser={ !isProEnabled }
          buttonLoading={ buttonLoading }
          onFormReset={ onFormReset }
          fontFamily={ fontFamily }
        />
      ),
    },
  ];
  const excludeTabs = [];
  const showPreview = !excludeTabs?.includes(tabName);
  return (
    <Fragment>
      <PanelHeader
        title={__(
          'Floating Bar Setting',
          'storegrowth-sales-booster'
        )}
        moduleId={moduleId}
      />
      <PanelContainer>
        <PanelRow>
          <PanelSettings
            colSpan={showPreview && tabName ? 12 : 24}
            tabPanels={tabPanels}
            changeHandler={changeTab}
            activeTab={tabName ? tabName : 'general'}
          />
          {showPreview && tabName && (
            <PanelPreview colSpan={12}>
              <Preview isProActive={ isProEnabled } formData={ formData } fontFamily={ fontFamily } />
            </PanelPreview>
          )}
        </PanelRow>
        {/* Render preview panel for responsive preview. */}
        <TouchPreview previewWidth={ 580 }>
          <Preview isProActive={ isProEnabled } formData={ formData } fontFamily={ fontFamily } />
        </TouchPreview>
      </PanelContainer>
    </Fragment>
  );
}

export default FloatingNotificationBarLayout;
