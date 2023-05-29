import { Form, Input, Select} from 'antd';
import { useDispatch, useSelect } from '@wordpress/data';
const { Option } = Select;



const BasicInfo = () => {
  const { setCreateFromData } = useDispatch( 'sgsb_order_bump' );
  const { createBumpData } = useSelect((select) => ({
    createBumpData: select('sgsb_order_bump').getCreateFromData()
  }));

  const onFieldChange = ( key, value ) => {
    setCreateFromData({
      ...createBumpData,
      [key]: value
    });
  };
  
return (
    <>
    
        <Form.Item
            label="Name of Order Bump"
            labelAlign="left"
            >
            <Input
                className   = 'question-mark'
                onChange    = {(v) => onFieldChange('name_of_order_bump', v.target.value)}
                placeholder = "Enter Order Bump Name"
                value       = {createBumpData.name_of_order_bump}
            />
            </Form.Item>
        
            <Form.Item
            label="Select Target Product(s)"
            labelAlign ='left'
            >
            <Select
                allowClear
                placeholder      = "Search for products"
                options          = {products_and_categories.product_list.productListForSelect}
                onChange         = {(v) => onFieldChange('target_products', v)}
                mode             = "multiple"
                filterOption     = {true}
                optionFilterProp = "label"
                value            = {createBumpData.target_products.map(Number)}
            />
            </Form.Item>

            <Form.Item
            label      = "Select Target Categories"
            labelAlign = 'left'

            >
            <Select
                allowClear
                placeholder      = "Search for Categories"
                mode             = "multiple"
                options          = {products_and_categories.category_list.catForSelect}
                onChange         = {(v) => onFieldChange('target_categories', v)}
                filterOption     = {true}
                optionFilterProp = "label"
                value={createBumpData.target_categories.map(Number)}
            />

            </Form.Item>

            <Form.Item
            label="Order Bump Schedule"
            labelAlign ='left'
            rules={[
                {
                message: 'Please select bump schedule',
                type: 'array',
                },
            ]}
            >
            <Select
            mode     = "multiple"
            onChange = {(v) => onFieldChange('bump_schedule', v)}
            value    = {createBumpData.bump_schedule}
            >
                <Option value="daily">Daily</Option>
                <Option value="saturday">Saturday</Option>
                <Option value="sunday">Sunday</Option>
                <Option value="monday">Monday</Option>
                <Option value="tuesday">Tuesday</Option>
                <Option value="wednesday">Wednesday</Option>
                <Option value="thursday">Thursday</Option>
                <Option value="friday">Friday</Option>

            </Select>
        </Form.Item>
  </>
  );
};

export default BasicInfo;