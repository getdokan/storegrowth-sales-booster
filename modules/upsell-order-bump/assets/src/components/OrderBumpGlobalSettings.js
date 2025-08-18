import { Form, Input, Select,Switch, Button} from 'antd';
const { TextArea } = Input;
const { Option } = Select;
const layout = {
  labelCol: {
    span: 8,
  },
  wrapperCol: {
    span: 12,
  },
};

const tailLayout = {
  wrapperCol: {
    offset: 8,
    span: 16,
  },
};


const OrderBumpGlobalSettings = () => {
  const [form] = Form.useForm();

  
  const onFinish = (values) => {
    
  };



return (
    <>
    <Form {...layout} 
    form={form} 
    name="control-hooks" 
    onFinish={onFinish}
    initialValues={{ 
        offer_skip:'yes',
        offer_remove:'remove_please',
        offer_adaption:'free_width',
        offer_location:'after_payment_gateway',
        offer_price:'offer_price'
     }}
    >
      
      <Form.Item
        name="offer_skip"
        label="Skip for the same offers"
        labelAlign ='left'
        
      >
        <Select
        className='question-mark'
          allowClear
        >
          <Option value="yes">Yes</Option>
          <Option value="no">No</Option>
          
        </Select>
      </Form.Item>

      <Form.Item
        name="offer_remove"
        label="Offer Target Dependency"
        labelAlign ='left'
        
      >
        <Select
        className='question-mark'
          
          allowClear
        >
          <Option value="remove_please">Remove offer when target product is removed</Option>
          <Option value="not_remove">Not Remove</Option>
          
        </Select>
      </Form.Item>

      <Form.Item
        name="offer_adaption"
        label="Offer adaption settings"
        labelAlign ='left'
       
      >
        <Select
        className='question-mark'
          placeholder="Free Width"
          allowClear
        >
          <Option value="free_width">Free Withd</Option>
          <Option value="custom_width">Custom Width</Option>
        </Select>
      </Form.Item>

      <Form.Item
        name="offer_location"
        label="Offer Location"
        labelAlign ='left'
       
      >
        <Select
          className='question-mark'
          placeholder="After Payment Gateway"
          allowClear
        >
          <Option value="after_payment_gateway">After Payment Gateways</Option>
          <Option value="not_defined">Not Defined</Option>
          
        </Select>
      </Form.Item>

      <Form.Item
        name="offer_price"
        label="Offer Price Format"
        labelAlign ='left'
       
      >
        <Select
          className='question-mark'
          placeholder="Offer Price"
          allowClear
        >
          <Option value="offer_price">Offer Price</Option>
          <Option value="not_defined">Not Defined</Option>
        </Select>
      </Form.Item>


      <Form.Item
        name="smart_offer"
        label="Smart Skip if Already Purchased"
        valuePropName="checked"
        labelAlign ='left'
       
      >
        <Switch defaultChecked valuePropName="checked" className='question-mark' />
      </Form.Item>

      <Form.Item
        name="custom_css"
        label="Global Custom CSS"
        labelAlign ='left'
       
      >
        <TextArea rows={4}  className='question-mark'/>
      </Form.Item>

      <Form.Item
        name="custom_js"
        label="Global Custom JS"
        labelAlign ='left'
       
      >
        <TextArea rows={4} className='question-mark'/>
      </Form.Item>

      <Button 
          type      = "primary" 
          htmlType  = "submit" 
          className = 'order-bump-save-change-button'
        >
            Save Changes
        </Button>
     
     
    </Form>
    
  </>
  );
};

export default OrderBumpGlobalSettings;