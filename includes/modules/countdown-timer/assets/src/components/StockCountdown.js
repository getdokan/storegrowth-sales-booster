import {
  Card,
  Form,
  Select,
  Typography,
  Input,
  Button,
  InputNumber,
  Space,
  Checkbox,
  notification
} from 'antd';
import { useEffect, useState } from '@wordpress/element';
import { useDispatch } from '@wordpress/data';
import InputColor from 'react-input-color';

function StockCountdown() {
  const { setPageLoading } = useDispatch( 'sgsb' );
  const [ buttonLoading, setButtonLoading ] = useState(false);

  const [ formData, setFormData ] = useState({
    widget_background_color: '#ffffff',
    border_color: '#cccccc',
    shop_page_countdown_enable: false,
    product_page_countdown_enable: true,
    countdown_heading: 'Last chance! [discount]% OFF',
  });


  const onFormSave = (type) => {
    setButtonLoading(true);

    let data = {
      action: 'sgsb_countdown_timer_save_settings',
      _ajax_nonce: sgsbAdmin.nonce,
      form_data: formData
    };

    jQuery.ajax({
      url: sgsbAdmin.ajax_url,
      method: 'POST',
      data: data
    }).success(() => {
      setButtonLoading(false);
      notification['success']({
        message     : 'Countdown Timer',
        description : 'Stock count down data updated successfully.',
      });
    });
  };

  const getSettings = () => {
    setPageLoading(true);

    jQuery.ajax({
      url: sgsbAdmin.ajax_url,
      method: 'POST',
      data: {
        action: 'sgsb_countdown_timer_get_settings',
        _ajax_nonce: sgsbAdmin.nonce,
      }
    }).success((response) => {
      if ( response.success ) {
        setFormData({...formData, ...response.data});
        setTimeout(() => setPageLoading(false), 500);
      }
    });
  };

  useEffect(() => {
    getSettings();
  }, []);

  const onFieldChange = (key, value) => {
    setFormData({ ...formData, [key]: value });
  };

  const isProStyle ={
    cursor: sgsbAdmin.isPro ? 'pointer' : 'not-allowed',
}

const isProFieldChange = (isPro,fieldKey, e) => {
  isPro?onFieldChange(fieldKey, e):"";
};

const upgradeLabel = !sgsbAdmin.isPro ? (
  <span className="sgsb-field-upgrade-pro-label">(Upgrade to premium)</span>
) : null;

  return (
    <Card>
      <Form
        labelCol={{
          span: 7,
        }}
        wrapperCol={{
          span: 17,
        }}
        autoComplete="off"
      >

        <Form.Item
          label="Widget Background Color"
          labelAlign="left"
        >
          <InputColor
            initialValue={formData.widget_background_color}
            onChange={(e) => onFieldChange('widget_background_color', e.hex)}
            placement="right"
          />
        </Form.Item>

        <Form.Item
          label="Border Color"
          labelAlign="left"
        >
          <InputColor
            initialValue={formData.border_color}
            onChange={(e) => onFieldChange('border_color', e.hex)}
            placement="right"
          />
        </Form.Item>

        <Form.Item
          label="Countdown Heading"
          labelAlign="left"
          extra={<div>[discount] will be replace with your actual discount percentage.<br /> e.g. Last chance! [discount]% OFF</div>}
        >
          <Input
            value={formData.countdown_heading}
            onChange={(e) => onFieldChange('countdown_heading', e.target.value)}
            style={{ width: 400 }}
            placeholder="Last chance! [discount]% OFF"
          />
        </Form.Item>

        <Form.Item
          label="Shop Page Display"
          labelAlign="left"
        >
          <Space direction="vertical">
            <Checkbox
              disabled = {!sgsbAdmin.isPro}
              checked={formData.shop_page_countdown_enable}
              value="shop_page_countdown_enable"
              onChange={sgsbAdmin.isPro?(e) => isProFieldChange(sgsbAdmin.isPro,'shop_page_countdown_enable', e.target.checked):''}
            ></Checkbox>
          </Space>
          <div>
            {upgradeLabel}
          </div>
        </Form.Item>

        <Form.Item
          label="Product Page Display"
          labelAlign="left"
        >
          <Space direction="vertical">
            <Checkbox
              checked={formData.product_page_countdown_enable}
              value="product_page_countdown_enable"
              onChange={(e) => onFieldChange('product_page_countdown_enable', e.target.checked)}
            ></Checkbox>
          </Space>
        </Form.Item>

        <Button type="primary" onClick={()=>onFormSave()} 
          loading={buttonLoading}
        >
          Save Changes
        </Button>
      </Form>
    </Card>
  );
}

export default StockCountdown;
