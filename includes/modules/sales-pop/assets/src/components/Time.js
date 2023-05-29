import { Form, Input, Switch, Button } from 'antd';
import { useDispatch, useSelect } from '@wordpress/data';


function Time( { onFormSave } ) {
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
        label="Loop"
        labelAlign='left'
      >
        <Switch
          checked={ (createPopupForm.loop == 'true' || createPopupForm.loop == true) ? true : false }
          onChange={ ( v ) => onFieldChange( 'loop', v ) }
        />
      </Form.Item>

      <Form.Item
        label="Next Time Display"
        labelAlign="left"
        extra="Time to start next notification(in seconds)"
      >
        <Input
          onChange={ ( v ) => onFieldChange( 'next_time_display', v.target.value ) }
          placeholder="Enter Next Time Display"
          value={ createPopupForm.next_time_display }
        />
      </Form.Item>
      <Form.Item
        label="Notification Per Page"
        labelAlign="left"
        extra="Quantity Notifications Per Page"
      >
        <Input
          onChange={ ( v ) => onFieldChange( 'notification_per_page', v.target.value ) }
          placeholder="Enter Notification Per Page"
          value={ createPopupForm.notification_per_page }
        />
      </Form.Item>

      <Form.Item
        label="Initial Time Delay"
        labelAlign="left"
        extra="When Your Site Load, Notification will wait this time to show(in seconds)"
      >
        <Input
          onChange={ ( v ) => onFieldChange( 'initial_time_delay', v.target.value ) }
          placeholder="Enter Initial Time Delay"
          value={ createPopupForm.initial_time_delay }
        />
      </Form.Item>

      <Form.Item
        label="Display Time"
        labelAlign="left"
        extra="Time your notification display"
      >
        <Input
          onChange={ ( v ) => onFieldChange( 'dispaly_time', v.target.value ) }
          placeholder="Enter Virtual Time"
          value={ createPopupForm.dispaly_time }
        />
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

export default Time;
