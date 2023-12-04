import { Button } from "antd";
const Preview = ({storeData}) => {
  return (
    <div>
      <Button type="primary" size={"large"}
      style={{
        color:storeData?.text_color,
        borderRadius:storeData?.button_border_radius,
        borderColor:storeData?.button_color,
        fontSize:storeData?.font_size,
        backgroundColor:storeData?.button_color,
        height:"fit-content",
        padding:"10px 30px",
        fontWeight:"600"
      }}
      >
        {storeData?.buy_now_button_label === "" ? "Enter Text" : storeData?.buy_now_button_label}
      </Button>
    </div>
  );
};

export default Preview;
