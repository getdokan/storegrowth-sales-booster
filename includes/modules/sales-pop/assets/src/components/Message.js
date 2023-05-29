import { Form, Input, Button, Typography } from 'antd';
import { useDispatch, useSelect } from '@wordpress/data';

const { TextArea } = Input;

function Message( { onFormSave } ) {
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
      <br />
      <Form.Item
        label="Message Popup"
        labelAlign='left'
        className='form-input-distance'
      >
        <TextArea
          rows={ 4 }
          value={ createPopupForm.message_popup }
          onChange={ ( v ) => onFieldChange( 'message_popup', v.target.value ) }
          placeholder='Enter Message Popup'
        />
      </Form.Item>
      <p>{ '{product_title} = Title of Product' }</p>
      <p>{ '{virtual_name} = Name of purchaser' }</p>
      <p>{ '{location} = Where from bought the product' }</p>
      <p>{ '{time} = When Product Purchased' }</p>


      <Button
        type="primary"
        onClick={ () => onFormSave( 'message' ) }
        className='order-bump-save-change-button'
        loading={ getButtonLoading }
      >
        Save Changes
      </Button>
    </>
  );
}

export default Message;
