import { useDispatch, useSelect } from '@wordpress/data';

import { createPopupForm, noop } from '../helper';
import { __ } from '@wordpress/i18n';
import Switcher from "../../../../../../assets/src/components/settings/Panels/PanelSettings/Fields/Switcher";
import SettingsSection from "../../../../../../assets/src/components/settings/Panels/PanelSettings/SettingsSection";
import { Fragment } from "react";
import ActionsHandler from "sales-booster/src/components/settings/Panels/PanelSettings/ActionsHandler";

function General( { onFormSave, upgradeTeaser } ) {
  const { setCreateFromData } = useDispatch( 'sgsb_order_sales_pop' );

  const { createPopupFormData, getButtonLoading } = useSelect( ( select ) => ({
    createPopupFormData : select( 'sgsb_order_sales_pop' ).getCreateFromData(),
    getButtonLoading    : select( 'sgsb_order_sales_pop' ).getButtonLoading()
  }) );

  const onFieldChange = ( key, value ) => {
    setCreateFromData( {
      ...createPopupFormData,
      [ key ]: value,
    } );
  };

  const onFormReset = () => {
    setCreateFromData( { ...createPopupForm } );
  }

  return (
    <Fragment>
      <SettingsSection>
        <Switcher
          colSpan={ 12 }
          name={ 'enable' }
          changeHandler={ onFieldChange }
          title={ __( 'Enable Popup', 'storegrowth-sales-booster' ) }
          isEnable={ (createPopupFormData.enable == 'true' || createPopupFormData.enable == true) ? true : false }
          tooltip={ __( 'By enabling the sales pop will show in the store.', 'storegrowth-sales-booster' ) }
        />
        <Switcher
          colSpan={ 12 }
          name={ 'mobile_view' }
          needUpgrade={ upgradeTeaser }
          changeHandler={ upgradeTeaser ? noop : onFieldChange }
          title={ __( 'Popup in Mobile', 'storegrowth-sales-booster' ) }
          tooltip={ __( 'By enabling the pop up will be visible in the mobile devices.', 'storegrowth-sales-booster' ) }
          isEnable={ (createPopupFormData.mobile_view == 'true' || createPopupFormData.mobile_view == true) ? true : false }
        />
      </SettingsSection>
      <ActionsHandler
        resetHandler={ onFormReset }
        loadingHandler={ getButtonLoading }
        saveHandler={ () => onFormSave( 'general_settings' ) }
      />
    </Fragment>
  );
}

export default General;
