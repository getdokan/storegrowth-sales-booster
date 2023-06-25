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
    progressbar_bg_color: '#444444',
    progressbar_fg_color: '#C3D168',
    progressbar_height: 5,
    shop_page_progress_bar_enable: false,
    shop_page_countdown_enable: false,
    product_page_progress_bar_enable: true,
    product_page_countdown_enable: true,
    countdown_heading: 'Last chance! [discount]% OFF',
    stock_display_format: 'above',
    total_sell_count_text: 'Total Sold',
    available_item_count_text: 'Available Item',
  });

  

  const onFormSave = (type) => {
    setButtonLoading(true);

    let data = {
      action: 'sgsb_stock_countdown_save_settings',
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
        message     : 'Stock Countdown',
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
        action: 'sgsb_stock_countdown_get_settings',
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
        <Typography.Title level={4} style={{marginBottom: '20px'}}>Stock Countdown Settings</Typography.Title>

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

        <Typography.Title level={4} style={{marginBottom: '20px'}}>Progress Bar</Typography.Title>

        <Form.Item
          label="Background Color"
          labelAlign="left"
        >
          <InputColor
            initialValue={formData.progressbar_bg_color}
            onChange={(e) => onFieldChange('progressbar_bg_color', e.hex)}
            placement="right"
          />
        </Form.Item>

        {/* <Form.Item
          label="Foreground Color"
          labelAlign="left"
        >
          <InputColor
            initialValue={formData.progressbar_fg_color}
            onChange={(e) => onFieldChange('progressbar_fg_color', e.hex)}
            placement="right"
          />
        </Form.Item> */}

        {/* <Form.Item
          label="Progress Bar Height"
          labelAlign="left"
        >
          <InputNumber
            min={1}
            addonAfter="px"
            value={formData.progressbar_height}
            onChange={(v) => onFieldChange('progressbar_height', v)}
            style={{ width: 100 }}
          />
        </Form.Item> */}

        {/* <Form.Item
          label="Stock Display Format"
          labelAlign="left"
        >
          <Select
            value={formData.stock_display_format}
            onChange={(v) => onFieldChange('stock_display_format', v)}
            style={{ width: 400 }}
          >
            <Select.Option value="above">Above Progress Bar</Select.Option>
            <Select.Option value="below">Below Progress Bar</Select.Option>
          </Select>
        </Form.Item> */}

        {/* {formData.stock_display_format === "above" && <div>
          <Form.Item
            label="Total Sell Count Text"
            labelAlign="left"
            extra="It will be placed left side of the above of the progress bar. e.g. Total Sold"
          >
            <Input
              value={formData.total_sell_count_text}
              onChange={(e) => onFieldChange('total_sell_count_text', e.target.value)}
              style={{ width: 400 }}
              placeholder="Total Sold"
            />
          </Form.Item>

          <Form.Item
            label="Available Item Count Text"
            labelAlign="left"
            extra="It will be placed right side of the above of the progress bar. e.g. Available Item"
          >
            <Input
              value={formData.available_item_count_text}
              onChange={(e) => onFieldChange('available_item_count_text', e.target.value)}
              style={{ width: 400 }}
              placeholder="Available Item"
            />
          </Form.Item>
        </div>} */}

        {/* <Typography.Title level={4} style={{marginBottom: '20px'}}>Shop Page</Typography.Title>

        <Form.Item
          label="Shop Page Display"
          labelAlign="left"
        >
          <Space direction="vertical">
            <Checkbox
              checked={formData.shop_page_progress_bar_enable}
              value="shop_page_progress_bar_enable"
              onChange={(e) => onFieldChange('shop_page_progress_bar_enable', e.target.checked)}
            >Progress Bar</Checkbox>
            <Checkbox
              checked={formData.shop_page_countdown_enable}
              value="shop_page_countdown_enable"
              onChange={(e) => onFieldChange('shop_page_countdown_enable', e.target.checked)}
            >Stock Countdown</Checkbox>
          </Space>
        </Form.Item> */}

        <Typography.Title level={4} style={{marginBottom: '20px'}}>Product Details Page</Typography.Title>

        <Form.Item
          label="Product Page Display"
          labelAlign="left"
        >
          <Space direction="vertical">
            <Checkbox
              checked={formData.product_page_progress_bar_enable}
              value="product_page_progress_bar_enable"
              onChange={(e) => onFieldChange('product_page_progress_bar_enable', e.target.checked)}
            >Progress Bar</Checkbox>
            <Checkbox
              checked={formData.product_page_countdown_enable}
              value="product_page_countdown_enable"
              onChange={(e) => onFieldChange('product_page_countdown_enable', e.target.checked)}
            >Stock Countdown</Checkbox>
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
