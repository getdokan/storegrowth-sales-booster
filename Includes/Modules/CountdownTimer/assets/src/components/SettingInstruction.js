import Image from "antd/es/image";
import React from "react";
import scInstruction from "../../images/sales-countdown-meta.png";
import FieldWrapper from "sales-booster/src/components/settings/Panels/PanelSettings/Fields/FieldWrapper";

const SettingInstruction = () => {
  return (
    <FieldWrapper colSpan={24} justify={`start`}>
      <div>
        <p>
          To set the countdown and discount of a specific product must go to{" "}
          <a href={`/wp-admin/edit.php?post_type=product`}>
            <strong>all products</strong>
          </a>{" "}
          in woocommerce. Then select a desired product to <b>Edit</b>. In the
          product meta of woocommerce you will be able to see{" "}
          <b>"Countdown Timer"</b>.
        </p>
        <Image preview={false} src={scInstruction} />
        <div
          style={{
            marginTop: "10px",
          }}
        >
          <p>
            Explore full range of products{" "}
            <a href={`/wp-admin/edit.php?post_type=product`}>
              <strong>here</strong>
            </a>
            .
          </p>
        </div>
        <div>
          <button
            style={{
              backgroundColor: "#0875ff",
              color: "#fff",
              padding: "10px 20px",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              display: "block",
              margin: "10px 0",
            }}
            onClick={() =>
              window.open(
                "https://storegrowth.io/docs/sales-countdown/",
                "_blank",
              )
            }
          >
            Documentation
          </button>
        </div>
      </div>
    </FieldWrapper>
  );
};

export default SettingInstruction;
