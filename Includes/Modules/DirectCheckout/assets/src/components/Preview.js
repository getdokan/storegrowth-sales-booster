import { Button } from "antd";
import { applyFilters } from "@wordpress/hooks";
const Preview = ({storeData}) => {
  const buttonStyles = applyFilters(
    "sgsb_direct_checkout_button_preview_styles",
    {
      color           : storeData?.text_color,
      height          : 'fit-content',
      padding         : '10px 30px',
      fontSize        : storeData?.font_size,
      fontWeight      : '600',
      borderColor     : storeData?.button_color,
      borderRadius    : storeData?.button_border_radius,
      backgroundColor : storeData?.button_color
    },
    storeData
  );

  return (
    <div>
      <Button
        type="primary"
        size={"large"}
        style={buttonStyles}
      >
        {storeData?.buy_now_button_label === "" ? "Enter Text" : storeData?.buy_now_button_label}
      </Button>
    </div>
  );
};

export default Preview;
