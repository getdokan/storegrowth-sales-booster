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
    progressbar_fg_color: '#c3d168',
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
      action: 'sgsb_stock_bar_save_settings',
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
        message     : 'Stock Bar',
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
        action: 'sgsb_stock_bar_get_settings',
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
          label="Background Color"
          labelAlign="left"
        >
          <InputColor
            initialValue={formData.progressbar_bg_color}
            onChange={(e) => onFieldChange('progressbar_bg_color', e.hex)}
            placement="right"
          />
        </Form.Item>

        <Form.Item
          label="Foreground Color"
          labelAlign="left"
        >
          <div
            style={isProStyle}
          >
              <InputColor
                initialValue={formData.progressbar_fg_color}
                onChange={sgsbAdmin.isPro?(e) => isProFieldChange(sgsbAdmin.isPro,'progressbar_fg_color',e.hex):""}
                placement="right"
              />
          </div>
          {upgradeLabel}
        </Form.Item>

        <Form.Item
          label="Stock Bar Height"
          labelAlign="left"
        >
          <div
          style={isProStyle}
          >
          <InputNumber
            disabled={!sgsbAdmin.isPro}
            min={1}
            addonAfter="px"
            value={formData.progressbar_height}
            onChange={sgsbAdmin.isPro?(v) => isProFieldChange(sgsbAdmin.isPro,'progressbar_height', v):''}
            style={{ width: 100 }}
          />
          </div>
          {upgradeLabel}
        </Form.Item>

        <Form.Item
          label="Stock Display Format"
          labelAlign="left"
        >
          <div style={isProStyle}>
          <Select
            disabled = {!sgsbAdmin.isPro}
            value={formData.stock_display_format}
            onChange={sgsbAdmin.isPro?(v) => isProFieldChange(sgsbAdmin.isPro,'stock_display_format', v):''}
            style={{ width: 400 }}
          >
            <Select.Option value="above">Above Stock Bar</Select.Option>
            <Select.Option value="below">Below Stock Bar</Select.Option>
          </Select>
          </div>
          {upgradeLabel}
        </Form.Item>

        {formData.stock_display_format === "above" && <div>
          <Form.Item
            label="Total Sell Count Text"
            labelAlign="left"
            extra="It will be placed left side of the above of the Stock Bar. e.g. Total Sold"
          >
            <Input
              disabled = {!sgsbAdmin.isPro}
              value={formData.total_sell_count_text}
              onChange={sgsbAdmin.isPro?(e) => isProFieldChange(sgsbAdmin.isPro,'total_sell_count_text', e.target.value):''}
              style={{ width: 400 }}
              placeholder="Total Sold"
            />
            <div>
            {upgradeLabel}
            </div>
          </Form.Item>

          <Form.Item
            label="Available Item Count Text"
            labelAlign="left"
            extra="It will be placed right side of the above of the Stock Bar. e.g. Available Item"
          >
            <Input
              disabled = {!sgsbAdmin.isPro}
              value={formData.available_item_count_text}
              onChange={sgsbAdmin.isPro?(e) => isProFieldChange(sgsbAdmin.isPro,'available_item_count_text', e.target.value):''}
              style={{ width: 400 }}
              placeholder="Available Item"
            />
            <div>
            {upgradeLabel}
            </div>
          </Form.Item>
        </div>}

        <Form.Item
          label="Display on Shop Page"
          labelAlign="left"
        >
          <Space direction="vertical">
            <Checkbox
              disabled = {!sgsbAdmin.isPro}
              checked={formData.shop_page_progress_bar_enable}
              value="shop_page_progress_bar_enable"
              onChange={sgsbAdmin.isPro?(e) => isProFieldChange(sgsbAdmin.isPro,'shop_page_progress_bar_enable', e.target.checked):''}
            ></Checkbox>
          </Space>
          <div>
            {upgradeLabel}
          </div>
        </Form.Item>

        <Form.Item
          label="Display on Product Page"
          labelAlign="left"
        >
          <Space direction="vertical">
            <Checkbox
              checked={formData.product_page_progress_bar_enable}
              value="product_page_progress_bar_enable"
              onChange={(e) => onFieldChange('product_page_progress_bar_enable', e.target.checked)}
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
