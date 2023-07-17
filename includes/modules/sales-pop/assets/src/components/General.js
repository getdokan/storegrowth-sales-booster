import { Form, Switch, Button } from 'antd';
import { useDispatch, useSelect } from '@wordpress/data';

import { noop } from '../helper';

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
      <Form.Item
        label="Enable Popup"
        labelAlign='left'
      >
        <Switch
          checked={ (createPopupForm.enable == 'true' || createPopupForm.enable == true) ? true : false }
          onChange={ ( v ) => onFieldChange( 'enable', v ) }
        />
      </Form.Item>
      <Form.Item
        label="Popup in Mobile"
        labelAlign='left'
      >
        <Switch
          disabled={ upgradeTeaser }
          checked={ (createPopupForm.mobile_view == 'true' || createPopupForm.mobile_view == true) ? true : false }
          onChange={ upgradeTeaser ? noop : ( v ) => onFieldChange( 'mobile_view', v ) }
        />
        <p>{upgradeTeaser}</p>
      </Form.Item>

      <Button
        type="primary"
        onClick={ () => onFormSave( 'general_settings' ) }
        className='order-bump-save-change-button'
        loading={ getButtonLoading }
      >
        Save Changes
      </Button>
    </>
  );
}

export default General;
