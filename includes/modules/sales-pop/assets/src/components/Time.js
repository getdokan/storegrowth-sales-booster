import { Form, Input, Switch, Button } from 'antd';
import { useDispatch, useSelect } from '@wordpress/data';

import { noop } from '../helper';

function Time( { onFormSave, upgradeTeaser } ) {
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

  
  /** 
   * This is a numeric validator method that allows positive and numeric values and rejects
   * any other kind of input values.
   * @param {*} key
   * @param {*} value
   */
  const handleNumericInputChange = (key, value) => {
    const numericValue = value.replace(/[^0-9]/g, '');
    onFieldChange(key, numericValue);
  };

  return (
    <>
      <Form.Item
        label="Loop"
        labelAlign='left'
      >
        <Switch
          disabled={upgradeTeaser}
          checked={ (createPopupForm.loop == 'true' || createPopupForm.loop == true) ? true : false }
          onChange={ upgradeTeaser ? noop : ( v ) => onFieldChange( 'loop', v ) }
        />
        <p>{upgradeTeaser}</p>
      </Form.Item>

      <Form.Item
        label="Next Time Display"
        labelAlign="left"
        extra="Time to start next notification(in seconds)"
      >
        <Input
          disabled={upgradeTeaser}
          onChange={ upgradeTeaser ? noop : ( v ) => handleNumericInputChange( 'next_time_display', v.target.value ) }
          placeholder="Enter Next Time Display"
          value={ createPopupForm.next_time_display }
        />
        {upgradeTeaser}
      </Form.Item>
      <Form.Item
        label="Notification Per Page"
        labelAlign="left"
        extra="Quantity Notifications Per Page"
      >
        <Input
          disabled={ upgradeTeaser }
          onChange={ upgradeTeaser ? noop : ( v ) => handleNumericInputChange( 'notification_per_page', v.target.value ) }
          placeholder="Enter Notification Per Page"
          value={ createPopupForm.notification_per_page }
        />
        {upgradeTeaser}
      </Form.Item>

      <Form.Item
        label="Initial Time Delay"
        labelAlign="left"
        extra="When Your Site Load, Notification will wait this time to show(in seconds)"
      >
        <Input
          disabled={upgradeTeaser}
          onChange={ upgradeTeaser ? noop : ( v ) => handleNumericInputChange( 'initial_time_delay', v.target.value ) }
          placeholder="Enter Initial Time Delay"
          value={ createPopupForm.initial_time_delay }
        />
        { upgradeTeaser }
      </Form.Item>

      <Form.Item
        label="Display Time"
        labelAlign="left"
        extra="Time your notification display"
      >
        <Input
          disabled={upgradeTeaser}
          onChange={ upgradeTeaser ? noop : ( v ) => handleNumericInputChange( 'dispaly_time', v.target.value ) }
          placeholder="Enter Virtual Time"
          value={ createPopupForm.dispaly_time }
        />
        {upgradeTeaser}
      </Form.Item>

      <Button
        disabled={upgradeTeaser}
        type="primary"
        onClick={ upgradeTeaser ? noop : () => onFormSave( 'general_settings' ) }
        className='order-bump-save-change-button'
        loading={ getButtonLoading }
      >
        Save Changes
      </Button>
    </>
  );
}

export default Time;
