import { Card, Form, Select, Slider, Col, Row } from 'antd';
import { useDispatch, useSelect } from '@wordpress/data';
import InputColor from 'react-input-color';


function DiscountSection() {

  const { setCreateFromData } = useDispatch( 'spsb_order_bump' );

  const { createBumpData } = useSelect((select) => ({
    createBumpData: select('spsb_order_bump').getCreateFromData()
  }));


  const onFieldChange = (key, value) => {
    setCreateFromData({
      ...createBumpData,
      [key]: value
    });
  };

  return (
    
      <div style={{marginBottom:'10px'}}>
        <div className="offer-offer-box-text">
          Discount Section
        </div>
     
        <Form.Item
          label      = "Background Color"
          labelAlign = 'left'
        >
          <InputColor
            initialValue = {createBumpData.discount_background_color}
            onChange     = {(v) => onFieldChange('discount_background_color', v.hex)}
            placement    = "right"

            style={{
              width  : 100,
              height : 30,
              float  : 'left',
            }}
          />
        </Form.Item>

        <Form.Item

          label      = "Text Color"
          labelAlign = 'left'
          className  = 'form-input-distance'

        >
          <InputColor
            initialValue = {createBumpData.discount_text_color}
            onChange     = {(v) => onFieldChange('discount_text_color', v.hex)}
            placement    = "right"

            style={{
              width  : 100,
              height : 30,
              float  : 'left',
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
                min      = {16}
                max      = {25}
                onChange = {(v) => onFieldChange('discount_font_size', v)}
                value    = {createBumpData.discount_font_size}
              />
            </Col>
            <Col span={6}>
              {createBumpData.discount_font_size}px
            </Col>
          </Row>
        </Form.Item>

  
      </div>
  );
};

export default DiscountSection;