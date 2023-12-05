import { __ } from "@wordpress/i18n";
import { useDispatch, useSelect } from "@wordpress/data";
import TextInput from "../../../../../../assets/src/components/settings/Panels/PanelSettings/Fields/TextInput";
import CheckboxGroup from "../../../../../../assets/src/components/settings/Panels/PanelSettings/Fields/CheckboxGroup";
import SingleCheckBox from "../../../../../../assets/src/components/settings/Panels/PanelSettings/Fields/SingleCheckBox";
import SettingsSection from "../../../../../../assets/src/components/settings/Panels/PanelSettings/SettingsSection";
import ActionsHandler from "sales-booster/src/components/settings/Panels/PanelSettings/ActionsHandler";
import { createDirectCheckoutForm } from "../helper";
import SettingInstruction from "./SettingInstruction";

function General({ onFormSave, upgradeTeaser }) {
  const modulePageRedirect = () => {
    window.location.href = "/wp-admin/admin.php?page=sgsb-Modules";
  };
  const { setCreateFromData } = useDispatch("sgsb_direct_checkout");
  const { createDirectCheckoutFormData, getButtonLoading } = useSelect(
    (select) => ({
      createDirectCheckoutFormData: select(
        "sgsb_direct_checkout"
      ).getCreateFromData(),
      getButtonLoading: select("sgsb_direct_checkout").getButtonLoading(),
    })
  );
  const isQuickCartActive = sgsbAdminQuickCartValidate.isQuickCartActivated;
  const onFieldChange = (key, value) => {
    setCreateFromData({
      ...createDirectCheckoutFormData,
      [key]: value,
    });
  };

  const onFormReset = () => {
    setCreateFromData({ ...createDirectCheckoutForm });
  };

  const noop = () => {};

  const fancyTextStyle = {
    color: "#3498db",
    fontWeight: "bold",
    textAlign: "center",
    padding: "10px",
    border: "1px solid #bdc3c7",
    borderRadius: "4px",
  };

  const redTextStyle = {
    color: "red",
  };

  const buttonLayoutOptions = [
    {
      label: `"Add to cart" as "${createDirectCheckoutFormData.buy_now_button_label}"`,
      value: "cart-to-buy-now",
      needUpgrade: upgradeTeaser,
      tooltip: __(
        `Use the add to cart button as the ${createDirectCheckoutFormData.buy_now_button_label} button`,
        "storegrowth-sales-booster"
      ),
    },
    {
      label: `"${createDirectCheckoutFormData.buy_now_button_label}" with "Add to cart"`,
      value: "cart-with-buy-now",
      tooltip: __("", "storegrowth-sales-booster"),
    },
    {
      label: `"${createDirectCheckoutFormData.buy_now_button_label}" for specific product"`,
      value: "specific-buy-now",
      needUpgrade: upgradeTeaser,
      tooltip: __(
        "This setting can be directly accessed from the woocommerce product meta page",
        "storegrowth-sales-booster"
      ),
    },
    {
      label: `Default Add to cart`,
      value: "default-add-to-cart",
      tooltip: __("", "storegrowth-sales-booster"),
    },
  ];

  // Define select options
  const checkoutPageOptions = [
    {
      label: __("Legacy Checkout", "storegrowth-sales-booster"),
      value: "legacy-checkout",
      tooltip: __(
        "The Chekout will redirect to the default checkout page.",
        "storegrowth-sales-booster"
      ),
    },
    {
      label: __("Quick Cart Checkout", "storegrowth-sales-booster"),
      value: "quick-cart-checkout",
      tooltip: __(
        "The checkout will redirect to Qucik Cart module cart chekout page.",
        "storegrowth-sales-booster"
      ),
      needUpgrade: upgradeTeaser,
      disabled: isQuickCartActive,
    },
  ];

  return (
    <>
      <SettingsSection>
        <TextInput
          needUpgrade={upgradeTeaser}
          name={"buy_now_button_label"}
          placeHolderText={__("Buy Now Label", "storegrowth-sales-booster")}
          fieldValue={createDirectCheckoutFormData.buy_now_button_label}
          className={`settings-field input-field`}
          changeHandler={upgradeTeaser ? noop : onFieldChange}
          title={__("Buy Now Button Label", "storegrowth-sales-booster")}
          tooltip={__(
            "This will be the set the Label of the Buy Now Button",
            "storegrowth-sales-booster"
          )}
        />
        <CheckboxGroup
          name={"buy_now_button_setting"}
          options={buttonLayoutOptions}
          selectedOptions={createDirectCheckoutFormData.buy_now_button_setting}
          handleCheckboxChange={onFieldChange}
          isSingleMode={true}
          title={__("Button Layout Setting", "storegrowth-sales-booster")}
          headColSpan={9}
          checkboxColSpan={15}
        />

        {createDirectCheckoutFormData.buy_now_button_setting ===
          "specific-buy-now" && <SettingInstruction />}

        <CheckboxGroup
          name={"checkout_redirect"}
          options={checkoutPageOptions}
          selectedOptions={createDirectCheckoutFormData.checkout_redirect}
          handleCheckboxChange={onFieldChange}
          isSingleMode={true}
          title={__("Checkout Redirect", "storegrowth-sales-booster")}
          headColSpan={9}
          checkboxColSpan={15}
        >
          {isQuickCartActive && !upgradeTeaser && (
            <div
              style={{
                marginTop: 10,
                ...fancyTextStyle,
              }}
            >
              <p>
                Please Activate the{" "}
                <span style={redTextStyle}>Quick Cart Module</span> to use the
                <span style={redTextStyle}> Quick Cart Checkout</span>{" "}
                Redirection.
              </p>
              <div>
                <button
                  style={{
                    backgroundColor: "#1677ff",
                    color: "#fff",
                    padding: "10px 20px",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer",
                  }}
                  onClick={modulePageRedirect}
                >
                  Modules Page
                </button>
              </div>
            </div>
          )}
        </CheckboxGroup>

        <SingleCheckBox
          needUpgrade={upgradeTeaser}
          name={"shop_page_checkout_enable"}
          checkedValue={createDirectCheckoutFormData.shop_page_checkout_enable}
          className={`settings-field checkbox-field`}
          changeHandler={upgradeTeaser ? noop : onFieldChange}
          title={__("Display on Shop Page", "storegrowth-sales-booster")}
          tooltip={__(
            "The direct checkout button will show on the shop page",
            "storegrowth-sales-booster"
          )}
        />
        <SingleCheckBox
          name={"product_page_checkout_enable"}
          checkedValue={
            createDirectCheckoutFormData.product_page_checkout_enable
          }
          className={`settings-field checkbox-field`}
          changeHandler={onFieldChange}
          title={__("Display on Product Page", "storegrowth-sales-booster")}
          tooltip={__(
            "The direct checkout button will show on the single product page",
            "storegrowth-sales-booster"
          )}
        />
      </SettingsSection>
      <ActionsHandler
        resetHandler={onFormReset}
        loadingHandler={getButtonLoading}
        saveHandler={() => onFormSave("general_settings")}
      />
    </>
  );
}

export default General;
