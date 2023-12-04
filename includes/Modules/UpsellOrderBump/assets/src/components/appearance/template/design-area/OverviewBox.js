import { Card, Form, Select, Slider, Col, Row, Input } from 'antd';
import { useDispatch, useSelect } from '@wordpress/data';
import InputColor from 'react-input-color';


function OverviewBox() {

  const { setCreateFromData } = useDispatch( 'sgsb_order_bump' );

  const { createBumpData } = useSelect((select) => ({
    createBumpData: select('sgsb_order_bump').getCreateFromData()
  }));

  const onFieldChange = ( key, value ) => {
    setCreateFromData({
      ...createBumpData,
      [key]: value
    } );
  };

 
  return (
    
      <div style={{marginBottom:'10px'}}>
      <div className="offer-offer-box-text">
        Bump Offer Box
      </div>
      <Form.Item
        label="Overview Border"
        labelAlign='left'

      >
        <Select
          placeholder="Change Overview Border"
          onChange={(v) => onFieldChange('box_border_style', v)}
          className='form-input-distance'
          value={createBumpData.box_border_style}
        >
          <Select.Option value="dotted">Dotted</Select.Option>
          <Select.Option value="dashed">Dashed</Select.Option>
          <Select.Option value="solid">Solid</Select.Option>
          <Select.Option value="no_border">No Border</Select.Option>

        </Select>
      </Form.Item>
     

      <Form.Item

        label      = "Border Color"
        labelAlign = 'left'
        className  = 'form-input-distance'
      >
        <InputColor
          initialValue = {createBumpData.box_border_color}
          onChange     = {(v) => onFieldChange('box_border_color', v.hex)}
          placement    = "right"
          style={{
            width  : 100,
            height : 30,
            float  : 'left',
          }}
        />


      </Form.Item>
      {}

      <Form.Item
        label      = "Top Margin"
        labelAlign = "left"
        className  = 'form-input-distance'
        
      >
        <Row>
          <Col span={18}>
            <Slider
              min      = {1}
              max      = {20}
              onChange = {(v) => onFieldChange('box_top_margin', v)}
              value    = {createBumpData.box_top_margin}
            />
          </Col>
          <Col span={6}>
            {createBumpData.box_top_margin}px
          </Col>
        </Row>
      </Form.Item>

      <Form.Item

        label      = "Bottom Margin"
        labelAlign = 'left'
        className  = 'form-input-distance'
        name       = "box_bottom_margin"
      >
        <Row>
          <Col span={18}>
            <Slider
              min      = {1}
              max      = {20}
              onChange = {(v) => onFieldChange('box_bottom_margin', v)}
              value    = {createBumpData.box_bottom_margin}
            />
          </Col>
          <Col span={6}>
            {createBumpData.box_bottom_margin}px
          </Col>
        </Row>
      </Form.Item>
      </div>
  );
};

export default OverviewBox;