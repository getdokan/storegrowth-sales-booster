import { Button } from "antd";
import { useSelect } from "@wordpress/data";
const Preview = () => {
  const { createDirectCheckoutForm } = useSelect((select) => ({
    createDirectCheckoutForm: select(
      "sgsb_direct_checkout"
    ).getCreateFromData(),
  }));
  const {
    buy_now_button_label,
    button_border_radius,
    button_color,
    font_size,
    text_color,
  } = createDirectCheckoutForm;
  return (
    <div>
      <Button type="primary" size={"large"}
      style={{
        color:text_color,
        borderRadius:button_border_radius,
        borderColor:button_color,
        fontSize:font_size,
        backgroundColor:button_color,
        height:"fit-content",
        padding:"10px 30px",
        fontWeight:"600"
      }}
      >
        {buy_now_button_label === "" ? "Enter Text" : buy_now_button_label}
      </Button>
    </div>
  );
};

export default Preview;
