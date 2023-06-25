import {
  Card,
  Form,
  Select,
  Typography,
  Input,
  Button,
  Tabs,
  Radio,
  Space,
  Checkbox,
  notification,
} from "antd";
import { useEffect, useState } from "@wordpress/element";
import { useDispatch } from "@wordpress/data";

/**
 * Genenral settings tab.
 */

function GenenralSettings({
  formData,
  onFieldChange,
  onFormSave,
  buttonLoading,
}) {
  return (
    <Form
      labelCol={{
        span: 10,
      }}
      wrapperCol={{
        span: 14,
      }}
      autoComplete="off"
    >
      <Form.Item label="Layout" labelAlign="left">
        <Radio.Group
          onChange={(e) => onFieldChange("layout", e.target.value)}
          value={formData.layout}
        >
          <Space direction="vertical">
            <Radio value="side">Side cart</Radio>
            {/* <Radio value="center" disabled={!sgsbAdmin.isPro}>
              <span>Centered popup test </span>
              {!sgsbAdmin.isPro && <span className="sgsb-field-upgrade-pro-label">(Upgrade to premium)</span>}
            </Radio> */}
          </Space>
        </Radio.Group>
      </Form.Item>

      <Form.Item label="Cart Contents" labelAlign="left">
        <Space direction="vertical">
          <Checkbox
            checked={formData.show_product_image}
            value="show_product_image"
            onChange={(e) =>
              onFieldChange("show_product_image", e.target.checked)
            }
          >
            Show product image
          </Checkbox>
          <Checkbox
            checked={formData.show_quantity_picker}
            value="show_quantity_picker"
            onChange={(e) =>
              onFieldChange("show_quantity_picker", e.target.checked)
            }
          >
            Show quantity picker
          </Checkbox>
          <Checkbox
            checked={formData.show_remove_icon}
            value="show_remove_icon"
            onChange={(e) =>
              onFieldChange("show_remove_icon", e.target.checked)
            }
          >
            Show remove icon
          </Checkbox>
          <Checkbox
            checked={formData.show_product_price}
            value="show_product_price"
            onChange={(e) =>
              onFieldChange("show_product_price", e.target.checked)
            }
          >
            Show product price
          </Checkbox>
          {/* <Checkbox
            checked={formData.show_coupon}
            value="show_coupon"
            onChange={(e) => onFieldChange('show_coupon', e.target.checked)}
            disabled={!sgsbAdmin.isPro}
          >
            <span>Show coupon </span>
            {!sgsbAdmin.isPro && <span className="sgsb-field-upgrade-pro-label">(Upgrade to premium)</span>}
          </Checkbox> */}
        </Space>
      </Form.Item>

      <Button
        type="primary"
        onClick={() => onFormSave("general_settings")}
        loading={buttonLoading}
      >
        Save Changes
      </Button>
    </Form>
  );
}

/**
 * Design Settings Tab
 */
function DesignSettings({
  formData,
  onFieldChange,
  onFormSave,
  buttonLoading,
}) {
  return (
    <Form
      labelCol={{
        span: 10,
      }}
      wrapperCol={{
        span: 14,
      }}
      autoComplete="off"
    >
      <Typography.Title level={4}>Design</Typography.Title>

      <Form.Item label="Cart Icon Position" labelAlign="left">
        <Select
          value={formData.icon_position}
          style={{ width: 170 }}
          onChange={(v) => onFieldChange("icon_position", v)}
        >
          <Select.Option value="top-left">Top Left</Select.Option>
          <Select.Option value="top-right">Top Right</Select.Option>
          <Select.Option value="bottom-left">Bottom Left</Select.Option>
          <Select.Option value="bottom-right">Bottom Right</Select.Option>
        </Select>
      </Form.Item>

      <Form.Item label="Cart Icon" labelAlign="left">
        <Select
          style={{ width: 250 }}
          value={formData.icon_name}
          onChange={(v) => onFieldChange("icon_name", v)}
        >
          <Select.Option value="flaticon-shopping-cart">
            flaticon-shopping-cart
          </Select.Option>
          <Select.Option value="flaticon-shopping-cart-1">
            flaticon-shopping-cart-1
          </Select.Option>
          <Select.Option value="flaticon-shopping-cart-2">
            flaticon-shopping-cart-2
          </Select.Option>
          <Select.Option value="flaticon-shopping-cart-3">
            flaticon-shopping-cart-3
          </Select.Option>
          <Select.Option value="flaticon-shopping-cart-4">
            flaticon-shopping-cart-4
          </Select.Option>
          <Select.Option value="flaticon-cart">flaticon-cart</Select.Option>
          <Select.Option value="flaticon-shopping-bag">
            flaticon-shopping-bag
          </Select.Option>
          <Select.Option value="flaticon-shopping-bag-1">
            flaticon-shopping-bag-1
          </Select.Option>
          <Select.Option value="flaticon-shopping-bag-2">
            flaticon-shopping-bag-2
          </Select.Option>
        </Select>
      </Form.Item>

      <Form.Item label="Cart Icon Color" labelAlign="left">
        <Input
          className="sgsb-flycart-color-picker"
          value={formData.icon_color}
          name="icon_color"
          style={{ width: 170 }}
        />
      </Form.Item>

      <Form.Item label="Buttons Background Color" labelAlign="left">
        <Input
          className="sgsb-flycart-color-picker"
          name="buttons_bg_color"
          value={formData.buttons_bg_color}
          style={{ width: 170 }}
        />
      </Form.Item>

      <Form.Item label="Widget Background Color" labelAlign="left">
        <Input
          className="sgsb-flycart-color-picker"
          name="widget_bg_color"
          value={formData.widget_bg_color}
          style={{ width: 170 }}
          onChange={(e) => onFieldChange("widget_bg_color", e.target.value)}
        />
      </Form.Item>

      <Button
        type="primary"
        onClick={() => onFormSave("design")}
        loading={buttonLoading}
      >
        Save Changes
      </Button>
    </Form>
  );
}

function FlyCart() {
  const { setPageLoading } = useDispatch("sgsb");
  const [buttonLoading, setButtonLoading] = useState(false);

  const [formData, updateFormData] = useState({
    icon_position: "bottom-right",
    icon_name: "flaticon-shopping-cart-3",
    icon_color: "#2ecc71",
    buttons_bg_color: "#2ecc71",
    widget_bg_color: "#fff",
    layout: "side",
    show_product_image: true,
    show_quantity_picker: true,
    show_delete_button: true,
    show_product_price: true,
    show_coupon: true,
  });

  const getSettings = () => {
    setPageLoading(true);

    jQuery
      .ajax({
        url: sgsbAdmin.ajax_url,
        method: "POST",
        data: {
          action: "sgsb_fly_cart_get_settings",
          _ajax_nonce: sgsbAdmin.nonce,
        },
      })
      .success((response) => {
        if (response.success) {
          updateFormData({ ...formData, ...response.data });
          setTimeout(() => initializeColorPicker(), 10);
          setTimeout(() => setPageLoading(false), 500);
        }
      });
  };

  useEffect(() => {
    getSettings();
  }, []);

  const initializeColorPicker = () => {
    jQuery(".sgsb-flycart-color-picker").wpColorPicker({
      change(event, ui) {
        // Not sure why it is needed, But it is required to work properly.;
        const fieldName = event.target.name;
        let fieldValue  = ui.color.toString();

        updateFormData((prevFormData) => ({
          ...prevFormData,
          [fieldName]: fieldValue,
        }));
      },
    });
  };

  const onFieldChange = (key, value) => {
    updateFormData({
      ...formData,
      [key]: value,
    });
  };

  const notificationMessage = (type) => {
    if (type == "general_settings") {
      notification["success"]({
        message: "General Settings Section",
        description: "General section settings data updated successfully.",
      });
    }

    if (type == "design") {
      notification["success"]({
        message: "Design Section",
        description: "Design section data updated successfully.",
      });
    }
  };
  const onFormSave = (type) => {
    setButtonLoading(true);

    let data = {
      action: "sgsb_fly_cart_save_settings",
      _ajax_nonce: sgsbAdmin.nonce,
      form_data: formData,
    };

    jQuery
      .ajax({
        url: sgsbAdmin.ajax_url,
        method: "POST",
        data: data,
      })
      .success(() => {
        setButtonLoading(false);
        notificationMessage(type);
      });
  };

  let tabColorPickerActivated = false;
  const onTabChange = (activeKey) => {
    if (activeKey != "1" && !tabColorPickerActivated) {
      tabColorPickerActivated = true;
      setTimeout(() => initializeColorPicker(), 10);
    }
  };

  return (
    <Card>
      <Tabs type="card" onChange={onTabChange}>
        <Tabs.TabPane tab="Genenral Settings" key="1">
          <GenenralSettings
            formData={formData}
            onFieldChange={onFieldChange}
            onFormSave={onFormSave}
            buttonLoading={buttonLoading}
          />
        </Tabs.TabPane>

        <Tabs.TabPane tab="Design" key="2">
          <DesignSettings
            formData={formData}
            onFieldChange={onFieldChange}
            onFormSave={onFormSave}
            buttonLoading={buttonLoading}
          />
        </Tabs.TabPane>
      </Tabs>
    </Card>
  );
}

export default FlyCart;
