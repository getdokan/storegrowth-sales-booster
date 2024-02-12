import { Button } from "antd";
const Preview = ({storeData}) => {
  return (
    <div>
      <Button
        type="primary"
        size={"large"}
        style={{
          color           : storeData?.text_color,
          border          : `${storeData?.border_width}px ${storeData?.button_border_style} ${storeData?.border_color}`,
          height          : "fit-content",
          padding         : `${storeData?.paddingYaxis}px ${storeData?.paddingXaxis}px`,
          fontSize        : storeData?.font_size,
          fontWeight      : "600",
          fontFamily      : storeData?.font_family,
          borderRadius    : storeData?.button_border_radius,
          backgroundColor : storeData?.button_color
        }}
      >
        {storeData?.buy_now_button_label === "" ? "Enter Text" : storeData?.buy_now_button_label}
      </Button>
    </div>
  );
};

export default Preview;
