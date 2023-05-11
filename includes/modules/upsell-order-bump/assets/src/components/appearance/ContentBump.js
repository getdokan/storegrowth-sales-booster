import { Form, Input, Select, Switch } from 'antd';
import { useDispatch, useSelect } from '@wordpress/data';
const { TextArea } = Input;

function ContentBump() {

  const { setCreateFromData } = useDispatch( 'storepulse_sales_booster_order_bump' );

  const { createBumpData } = useSelect((select) => ({
    createBumpData: select('storepulse_sales_booster_order_bump').getCreateFromData()
  }));


  const layout = {
    labelCol: {
      span: 8,
    },
    wrapperCol: {
      span: 15,
    },
  };


  const onFieldChange = (key, value) => {
    setCreateFromData({
      ...createBumpData,
      [key]: value
    });
  };

 
  return (
    <div style={{marginBottom:'10px'}}>
      <Form.Item
        label      = "Discount Title"
        labelAlign = 'left'
      >
        For Discount %
        <Input 
          value       = {createBumpData.offer_discount_title}
          onChange    = {(v) => onFieldChange('offer_discount_title', v.target.value)}
          placeholder = 'Enter Order Bump Name' 
         />
         For Fixed Price
        <Input 
          value       = {createBumpData.offer_fixed_price_title}
          onChange    = {(v) => onFieldChange('offer_fixed_price_title', v.target.value)}
          placeholder = 'Enter Order Bump Name' 
         />
      </Form.Item>

      <Form.Item
        label      = "Product Description"
        labelAlign = 'left'
      >
        <TextArea 
          rows        = {4} 
          value       = {createBumpData.product_description}
          onChange    = {(v) => onFieldChange('product_description', v.target.value)}
          placeholder = 'Enter Order Bump Name'
        />
        
      </Form.Item>

      <Form.Item
        label      = "Selection Title"
        labelAlign = 'left'
      >
        <Input 
          value       = {createBumpData.selection_title}
          onChange    = {(v) => onFieldChange('selection_title', v.target.value)}
          placeholder = 'Enter Order Bump Name'
        />
         
      </Form.Item>

      <Form.Item
        label      = "Offer Description"
        labelAlign = 'left'
       
      >
        
        <TextArea 
          rows        = {4} 
          value       = {createBumpData.offer_description}
          onChange    = {(v) => onFieldChange('offer_description', v.target.value)}
          placeholder = 'Enter Order Bump Name'
         />
      </Form.Item>
    </div>
  );
}

export default ContentBump;