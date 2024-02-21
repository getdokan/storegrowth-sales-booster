import FieldWrapper from "sales-booster/src/components/settings/Panels/PanelSettings/Fields/FieldWrapper";

const SettingInstruction = () => {
  return (
    <FieldWrapper colSpan={24} justify={`start`}>
      <div>
        <p>
          To set the free shipping method please go to{" "}
          <b>
            <a href={`/wp-admin/admin.php?page=wc-settings&tab=shipping`}>
              <strong>Shipping</strong>
            </a>
          </b>{" "}
          in woocommerce setting. Then add a{" "}
          <b>
            <a
              href={`/wp-admin/admin.php?page=wc-settings&tab=shipping&zone_id=new`}
            >
              <strong>Shipping Zone</strong>
            </a>{" "}
          </b>
          . In the shipping zone add the <b>"Shipping Method"</b> of{" "}
          <b>"Free Shipping"</b> and set an conditional amount to avail the free
          shipping.
        </p>

        <div
          style={{
            marginTop: "10px",
          }}
        >
          <p>
            For more please visit the{" "}
            <a href={`https://woo.com/document/free-shipping/`} target="_blank">
              <strong>Woocommerce Documentation</strong>
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
                "https://storegrowth.io/docs/free-shipping-bar-setting/",
                "_blank"
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
