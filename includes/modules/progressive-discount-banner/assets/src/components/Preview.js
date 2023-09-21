import { Image } from "antd";
import React from "react";
import RemoveCross from "../../images/sgsb-pd-banner-bar-remove.svg";

const Preview = ({ formData, fontFamily }) => {
  const bannerStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    height: formData.banner_height,
    color: formData.text_color,
    padding: "2px 20px",
    borderRadius: "5px",
    backgroundColor: formData.background_color,
  };

  const cart_min_amount =
    sgsbAdmin.currencySymbol + formData.cart_minimum_amount;

  const dynamicText = formData.progressive_banner_text.replace(
    "[amount]",
    cart_min_amount
  );

  const getLabelByValue = (value, object) => {
    const font = object.find((font) => font.value === value);
    return font ? font.label : "";
  };

  const selectedFont = getLabelByValue(formData.font_family, fontFamily);

  return (
    <div className="sgsb-pd-banner-bar-wrapper">
      <div className="sgsb-pd-banner-bar" style={bannerStyle}>
        <div style={{ fontSize: "24px", color: "#000", padding: "2px" }}>
          <div
            dangerouslySetInnerHTML={{
              __html: formData.progressive_banner_icon_html,
            }}
          />
        </div>
        <span
          className="sgsb-pd-banner-text"
          style={{
            textAlign: "center",
            fontFamily: selectedFont,
            fontSize: formData.font_size,
          }}
        >
          {dynamicText}
        </span>
        <div className="sgsb-pd-banner-bar-remove">
          <Image src={RemoveCross} />
        </div>
      </div>
    </div>
  );
};

export default Preview;
