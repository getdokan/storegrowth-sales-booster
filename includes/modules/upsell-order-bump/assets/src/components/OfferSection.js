import { Form, InputNumber, Select, Row, Col } from 'antd';
import { useDispatch, useSelect } from '@wordpress/data';
const { Option } = Select;



const OfferSection = ({clearErrors}) => {
  const { setCreateFromData } = useDispatch( 'sgsb_order_bump' );
  const { createBumpData } = useSelect((select) => ({
    createBumpData: select('sgsb_order_bump').getCreateFromData()
  }));

  const onFieldChange = (key, value) => {
    clearErrors();
    if ( key=='offer_product' ) {
      setCreateFromData( {
        ...createBumpData,
        [key]               : value,
        offer_image_url     : products_and_categories.product_list_for_view[value].image_url,
        offer_product_title : products_and_categories.product_list_for_view[value].post_title,
        offer_product_regular_price : products_and_categories.product_list_for_view[value].regular_price
      } );
    } else {
      setCreateFromData( {
        ...createBumpData,
        [key]: value
      } );
    }
  };
  
  const targetProducts = createBumpData.target_products;
  const originalSimpleProductForOffer = products_and_categories.product_list.simpleProductForOffer;
  const simpleProductForOffer = Array.isArray(targetProducts) && targetProducts.length !== 0 ? originalSimpleProductForOffer.filter(item => !targetProducts.includes(item.value) ) : originalSimpleProductForOffer;

return (
    <>
    
   
    <Form.Item
      label="Offer Product"
      labelAlign ='left'
      rules={[
        {
          required: true,
          message: 'Please Select Offer Product',
        },
      ]}
      
    >
      <Select
        placeholder="Search for offer product"
        showSearch
        onChange={(v) => onFieldChange('offer_product', v)}
        value={parseInt(createBumpData.offer_product)?parseInt(createBumpData.offer_product):null}
        filterOption = {(inputValue, option) => option.props.children
            .toString()
            .toLowerCase()
            .includes(inputValue.toLowerCase())
        }
      >
        {
        simpleProductForOffer.map((item,i)=>
        <Option  value={item.value} >
          {item.label}
        </Option>)
        }
        
      </Select>
    </Form.Item>

      

    <Form.Item label="Offer Price/Discount"
      
      labelAlign ='left'
      
      >
      <Row gutter={8}>
        <Col span={6}>
        <Form.Item
            
            noStyle
            rules={[
              {
                message: 'Please select offer type',
              },
            ]}
          >
            <Select
            onChange={(v) => onFieldChange('offer_type', v)}
            value={createBumpData.offer_type}
      
      >
        <Option value="discount">Discount%</Option>
        <Option value="price">Price</Option>
        
      </Select>
          </Form.Item>
          
        </Col>
        <Col span={18}>
          <Form.Item
            noStyle
            rules={[
              {
                message: 'Please input offer amount',
              },
            ]}
          >
          <InputNumber
            min={0}
            style={{ width: '100%' }}
            onChange={(value) => onFieldChange('offer_amount', value)}
            value={createBumpData.offer_amount}
              />
          </Form.Item>
        </Col>
        
      </Row>
    </Form.Item>
  </>
  );
};

export default OfferSection;
