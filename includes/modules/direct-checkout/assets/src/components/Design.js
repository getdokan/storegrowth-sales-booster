import {
  Form,
  Button,
  InputNumber,
} from "antd";
import InputColor from "react-input-color";
import { useDispatch, useSelect } from "@wordpress/data";

function Design({ onFormSave }) {
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
      <Form.Item label="Button Color" labelAlign="left">
        <InputColor
          initialValue={createDirectCheckoutForm.button_color}
          onChange={(e) => onFieldChange("button_color", e.hex)}
          placement="right"
        />
      </Form.Item>

      <Form.Item label="Text Color" labelAlign="left">
        <InputColor
          initialValue={createDirectCheckoutForm.text_color}
          onChange={(e) => onFieldChange("button_color", e.hex)}
          placement="right"
        />
      </Form.Item>

      <Form.Item label="Font Size" labelAlign="left">
        <InputNumber
          min={1}
          defaultValue={createDirectCheckoutForm.font_size}
          onChange={(e) => onFieldChange("font_size", e)}
          addonAfter={"px"}
          placement="right"
        />
      </Form.Item>

      <Form.Item label="Font Size" labelAlign="left">
        <InputNumber
          min={1}
          defaultValue={createDirectCheckoutForm.button_border_radius}
          onChange={(e) => onFieldChange("button_border_radius", e)}
          addonAfter={"px"}
          placement="right"
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

export default Design;
