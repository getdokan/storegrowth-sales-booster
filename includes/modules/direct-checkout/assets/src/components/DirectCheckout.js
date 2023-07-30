import {
  Card,
  Form,
  Select,
  Radio,
  Input,
  Button,
  InputNumber,
  Space,
  Checkbox,
  notification,
} from "antd";
import { useEffect, useState } from "@wordpress/element";
import { useDispatch } from "@wordpress/data";

function DirectCheckout() {
  const { setPageLoading } = useDispatch("sgsb");
  const [buttonLoading, setButtonLoading] = useState(false);

  const [formData, setFormData] = useState({
    buy_now_button_setting: "cart-with-buy-now",
    buy_now_button_label: "Buy Now",
    checkout_redirect: "checkout",
    checkout_custom_link: "",
    shop_page_checkout_enable: false,
    product_page_checkout_enable: true,
  });
  console.log(formData);
  const onFormSave = (type) => {
    setButtonLoading(true);

    let data = {
      action: "sgsb_direct_checkout_save_settings",
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
        notification["success"]({
          message: "Direct Checkout",
          description: "Data updated successfully.",
        });
      });
  };

  const getSettings = () => {
    setPageLoading(true);

    jQuery
      .ajax({
        url: sgsbAdmin.ajax_url,
        method: "POST",
        data: {
          action: "sgsb_direct_checkout_get_settings",
          _ajax_nonce: sgsbAdmin.nonce,
        },
      })
      .success((response) => {
        if (response.success) {
          setFormData({ ...formData, ...response.data });
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

  const isProStyle = {
    cursor: sgsbAdmin.isPro ? "pointer" : "not-allowed",
  };

  const isProFieldChange = (isPro, fieldKey, e) => {
    isPro ? onFieldChange(fieldKey, e) : "";
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
          label="Buy Now Button Label"
          labelAlign="left"
          extra="This will be the set the Label of the Buy Now Button"
        >
          <Input
            value={formData.buy_now_button_label}
            onChange={(e) =>
              onFieldChange("buy_now_button_label", e.target.value)
            }
            style={{ width: 400 }}
            placeholder="Total Sold"
          />
        </Form.Item>

        <Form.Item label="Button Layout Setting" labelAlign="left">
          <Radio.Group
            onChange={(e) =>
              onFieldChange("buy_now_button_setting", e.target.value)
            }
            value={formData.buy_now_button_setting}
          >
            <Space direction="vertical">
              <Radio value="cart-to-buy-now">"Add to cart" as "Buy Now"</Radio>
              <Radio value="cart-with-buy-now">
                <span>"Buy Now" with "Add to cart"</span>
              </Radio>
              <Radio value="specific-buy-now">
                <span>"Buy Now" for specific product"</span>
              </Radio>
              <Radio value="default-add-to-cart">
                <span>Default Add to cart</span>
              </Radio>
            </Space>
          </Radio.Group>
        </Form.Item>

        <Form.Item label="Buy Now Button Redirect" labelAlign="left">
          <Select
            value={formData.checkout_redirect}
            onChange={(v) => onFieldChange("checkout_redirect", v)}
            style={{ width: 400 }}
          >
            <Select.Option value="checkout">Checkout</Select.Option>
            <Select.Option value="custom-link">Custom Link</Select.Option>
          </Select>
        </Form.Item>

        {formData.checkout_redirect === "custom-link" && (
          <div>
            <Form.Item
              label="custom link"
              labelAlign="left"
              extra="The custom link to redirect for checkout the product"
            >
              <Input
                value={formData.checkout_custom_link}
                onChange={(e) =>
                  onFieldChange("checkout_custom_link", e.target.value)
                }
                style={{ width: 400 }}
                placeholder="https://www.examplestore.com/checkout
                "
              />
            </Form.Item>
          </div>
        )}

        <Form.Item label="Display on Shop Page" labelAlign="left">
          <Space direction="vertical">
            <Checkbox
              checked={formData.shop_page_checkout_enable}
              value="shop_page_checkout_enable"
              onChange={(e) =>
                onFieldChange("shop_page_checkout_enable", e.target.checked)
              }
            ></Checkbox>
          </Space>
        </Form.Item>

        <Form.Item label="Display on Product Page" labelAlign="left">
          <Space direction="vertical">
            <Checkbox
              checked={formData.product_page_checkout_enable}
              value="product_page_checkout_enable"
              onChange={(e) =>
                onFieldChange("product_page_checkout_enable", e.target.checked)
              }
            ></Checkbox>
          </Space>
        </Form.Item>

        <Button
          type="primary"
          onClick={() => onFormSave()}
          loading={buttonLoading}
        >
          Save Changes
        </Button>
      </Form>
    </Card>
  );
}

export default DirectCheckout;
