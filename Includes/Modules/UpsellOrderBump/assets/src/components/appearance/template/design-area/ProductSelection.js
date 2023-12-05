import { Card, Form, Select, Slider, Col, Row } from 'antd';
import { useDispatch, useSelect } from '@wordpress/data';
import InputColor from 'react-input-color';


function ProductSelection() {

  const { setCreateFromData } = useDispatch( 'sgsb_order_bump' );

  const { createBumpData } = useSelect((select) => ( {
    createBumpData: select('sgsb_order_bump').getCreateFromData()
  }) );


  const onFieldChange = ( key, value ) => {
    setCreateFromData( {
      ...createBumpData,
      [key]: value
    } );
  };



  return (
    
      <div>
      <div className="offer-offer-box-text">
        Product Section
      </div>
     
      <Form.Item

        label      = "Text Color"
        labelAlign = 'left'

      >
        <InputColor
          initialValue = {createBumpData.product_description_text_color}
          onChange     = {(v) => onFieldChange('product_description_text_color', v.hex)}
          placement    = "right"

          style={{
            width  : 100,
            height : 30,
            float  : 'left'

          }}
        />
      </Form.Item>

      <Form.Item
        label      = "Font Size"
        labelAlign = "left"
        className  = 'form-input-distance'
      >
        <Row>
          <Col span={18}>
            <Slider
              min      = {14}
              max      = {22}
              onChange = {(v) => onFieldChange('product_description_font_size', v)}
              value    = {createBumpData.product_description_font_size}
            />
          </Col>
          <Col span={6}>
            {createBumpData.product_description_font_size}px
          </Col>
        </Row>
      </Form.Item>

  
      </div>
  );
}

export default ProductSelection;