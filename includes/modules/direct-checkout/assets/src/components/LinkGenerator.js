import { Form, Select, Input, Button, Space, Checkbox } from "antd";
const { TextArea } = Input;
import { useDispatch, useSelect } from "@wordpress/data";

function LinkGenerator({ onFormSave }) {
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
  const options = [];
  for (let i = 10; i < 36; i++) {
    options.push({
      label: i.toString(36) + i,
      value: i.toString(36) + i,
    });
  }
  
  return (
    <>
      <Form.Item
        label="Products to Add to Cart"
        labelAlign="left"
        extra="The list of select products tahat will be added to cart"
      >
        <Select
          mode="multiple"
          allowClear
          style={{
            width: "100%",
          }}
          placeholder="Please select"
          defaultValue={["a10", "c12"]}
          // onChange={}
          options={options}
        />
      </Form.Item>
      <Form.Item
        label="Select Coupons"
        labelAlign="left"
        extra="Select the coupons that will be applied for"
      >
        <Select
          mode="multiple"
          allowClear
          style={{
            width: "100%",
          }}
          placeholder="Please select"
          defaultValue={["a10", "c12"]}
          // onChange={}
          options={options}
        />
      </Form.Item>

      <Form.Item label="Shipping Method" labelAlign="left">
        <Select
          value={createDirectCheckoutForm.checkout_redirect}
          onChange={(v) => onFieldChange("checkout_redirect", v)}
          style={{ width: 400 }}
        >
          <Select.Option value="checkout">Checkout</Select.Option>
          <Select.Option value="custom-link">Custom Link</Select.Option>
        </Select>
      </Form.Item>

      {createDirectCheckoutForm.checkout_redirect === "custom-link" && (
        <div>
          <Form.Item
            label="custom link"
            labelAlign="left"
            extra="The custom link to redirect for checkout the product"
          >
            <Input
              value={createDirectCheckoutForm.checkout_custom_link}
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

      <Form.Item label="Generated Link" labelAlign="left">
      <TextArea
          rows={ 4 }
          value={createDirectCheckoutForm.generated_link}
          onChange={ ( e ) => onFieldChange( 'generated_link', e.target.value ) }
          placeholder={"jellosjaa adlajfka"}
        />
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

export default LinkGenerator;
