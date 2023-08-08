import { Form, Select, Radio, Input, Button, Space, Checkbox } from "antd";

import { useDispatch, useSelect } from "@wordpress/data";

function General({ onFormSave }) {
  const { setCreateFromData } = useDispatch("sgsb_direct_checkout");

  const { createDirectCheckoutForm, getButtonLoading } = useSelect(
    (select) => ({
      createDirectCheckoutForm: select(
        "sgsb_direct_checkout"
      ).getCreateFromData(),
      getButtonLoading: select("sgsb_direct_checkout").getButtonLoading(),
    })
  );

  const onFieldChange = (key, value) => {
    setCreateFromData({
      ...createDirectCheckoutForm,
      [key]: value,
    });
  };

  return (
    <>
      <Form.Item
        label="Buy Now Button Label"
        labelAlign="left"
        extra="This will be the set the Label of the Buy Now Button"
      >
        <Input
          value={createDirectCheckoutForm.buy_now_button_label}
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
          value={createDirectCheckoutForm.buy_now_button_setting}
        >
          <Space direction="vertical">
            <Radio value="cart-to-buy-now">"Add to cart" as "Buy Now"</Radio>
            <Radio value="cart-with-buy-now">
              <span>"Buy Now" with "Add to cart"</span>
            </Radio>
            <Radio value="specific-buy-now">
              <span>"Buy Now" for specific product"</span>
              {createDirectCheckoutForm.buy_now_button_setting ===
                "specific-buy-now" && (
                <div style={{ color: "red" }}>
                  <span>
                    Please set the setting from the Woocommerce product tab.
                  </span>
                </div>
              )}
            </Radio>
            <Radio value="default-add-to-cart">
              <span>Default Add to cart</span>
            </Radio>
          </Space>
        </Radio.Group>
      </Form.Item>
      {createDirectCheckoutForm.buy_now_button_setting !==
        "default-add-to-cart" && (
        <div>
          <Form.Item label="Buy Now Button Redirect" labelAlign="left">
            <Select
              value={createDirectCheckoutForm.checkout_redirect}
              onChange={(v) => onFieldChange("checkout_redirect", v)}
              style={{ width: 400 }}
            >
              <Select.Option value="legacy-checkout">
                Legacy Checkout
              </Select.Option>
              <Select.Option value="quick-cart-checkout">
                Quick Cart Checkout
              </Select.Option>
            </Select>
          </Form.Item>
        </div>
      )}
      {createDirectCheckoutForm.buy_now_button_setting ===
          "specific-buy-now" && (
          <div style={{ color: "red",maxWidth:"400px" }}>
            <span>
              The function of displaying in shop and product page only applicable for ("Buy Now" with "Add to cart")
            </span>
          </div>
        )}
      <Form.Item label="Display on Shop Page" labelAlign="left">
        <Space direction="vertical">
          <Checkbox
            checked={createDirectCheckoutForm.shop_page_checkout_enable}
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
            checked={createDirectCheckoutForm.product_page_checkout_enable}
            value="product_page_checkout_enable"
            onChange={(e) =>
              onFieldChange("product_page_checkout_enable", e.target.checked)
            }
          ></Checkbox>
        </Space>
      </Form.Item>

      <Button
        type="primary"
        onClick={() => onFormSave("general_settings")}
        className="order-bump-save-change-button"
        loading={getButtonLoading}
      >
        Save Changes
      </Button>
    </>
  );
}

export default General;
