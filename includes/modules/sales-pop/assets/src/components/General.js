import { Form, Switch, Button } from 'antd';
import { useDispatch, useSelect } from '@wordpress/data';

import { noop } from '../helper';
import { __ } from '@wordpress/i18n';
import Switcher from "../../../../../../assets/src/components/settings/Panels/PanelSettings/Fields/Switcher";
import SettingsSection from "../../../../../../assets/src/components/settings/Panels/PanelSettings/SettingsSection";

function General( { onFormSave, upgradeTeaser } ) {
  const { setCreateFromData } = useDispatch( 'sgsb_order_sales_pop' );

  const { createPopupForm, getButtonLoading } = useSelect( ( select ) => ({
    createPopupForm: select( 'sgsb_order_sales_pop' ).getCreateFromData(),
    getButtonLoading: select( 'sgsb_order_sales_pop' ).getButtonLoading()
  }) );

  const onFieldChange = ( key, value ) => {
    setCreateFromData( {
      ...createPopupForm,
      [ key ]: value,
    } );
  };

  return (
    <>
      <SettingsSection>
        <Switcher
          colSpan={ 12 }
          name={ 'enable' }
          changeHandler={ onFieldChange }
          title={ __( 'Enable Popup', 'storegrowth-sales-booster' ) }
          isEnable={ (createPopupForm.enable == 'true' || createPopupForm.enable == true) ? true : false }
        />
        <Switcher
          colSpan={ 12 }
          name={ 'mobile_view' }
          needUpgrade={ upgradeTeaser }
          changeHandler={ upgradeTeaser ? noop : onFieldChange }
          title={ __( 'Popup in Mobile', 'storegrowth-sales-booster' ) }
          isEnable={ (createPopupForm.mobile_view == 'true' || createPopupForm.mobile_view == true) ? true : false }
        />
      </SettingsSection>

      <Button
        type="primary"
        loading={ getButtonLoading }
        className='sgsb-settings-save-button'
        onClick={ () => onFormSave( 'general_settings' ) }
      >
          { __( 'Save', 'storegrowth-sales-booster' ) }
      </Button>
    </>
  );
}

export default General;
