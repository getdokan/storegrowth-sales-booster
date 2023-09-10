import { Button} from "antd";
import { __ } from "@wordpress/i18n";
import { useDispatch, useSelect } from "@wordpress/data";
import TextInput from "../../../../../../assets/src/components/settings/Panels/PanelSettings/Fields/TextInput";
import CheckboxGroup from "../../../../../../assets/src/components/settings/Panels/PanelSettings/Fields/CheckboxGroup";
import SingleCheckBox from "../../../../../../assets/src/components/settings/Panels/PanelSettings/Fields/SingleCheckBox";
import SelectBox from "../../../../../../assets/src/components/settings/Panels/PanelSettings/Fields/SelectBox";
import SettingsSection from "../../../../../../assets/src/components/settings/Panels/PanelSettings/SettingsSection";

function General({ onFormSave, upgradeTeaser }) {
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

  const checkboxesOption = [
    {
      label: `"Add to cart" as "Buy Now"`,
      value: "cart-to-buy-now",
      needUpgrade: upgradeTeaser,
      tooltip: __("Use the add to cart button as the buy now button", "storegrowth-sales-booster"),
    },
    {
      label: `"Buy Now" with "Add to cart"`,
      value: "cart-with-buy-now",
      needUpgrade: false,
      tooltip: __("", "storegrowth-sales-booster"),
    },
    {
      label: `"Buy Now" for specific product"`,
      value: "specific-buy-now",
      needUpgrade: upgradeTeaser,
      tooltip: __("This setting can be directly accessed from the woocommerce product meta page", "storegrowth-sales-booster"),
    },
    {
      label: `Default Add to cart`,
      value: "default-add-to-cart",
      needUpgrade: false,
      tooltip: __("", "storegrowth-sales-booster"),
    },
  ];

  // Define select options
  const selectOptions = [
    { value: "legacy-checkout", label: "Legacy Checkout" },
    { value: "quick-cart-checkout", label: "Quick Cart Checkout" },
  ];

  return (
    <>
      <SettingsSection>
        <TextInput
          needUpgrade={upgradeTeaser}
          name={"buy_now_button_label"}
          placeHolderText={__("Buy Now Label", "storegrowth-sales-booster")}
          fieldValue={createDirectCheckoutForm.buy_now_button_label}
          className={`settings-field input-field`}
          changeHandler={onFieldChange}
          title={__("Buy Now Button Label", "storegrowth-sales-booster")}
          tooltip={__(
            "This will be the set the Label of the Buy Now Button",
            "storegrowth-sales-booster"
          )}
        />
        <CheckboxGroup
          name={"buy_now_button_setting"}
          options={checkboxesOption}
          selectedOptions={createDirectCheckoutForm.buy_now_button_setting}
          handleCheckboxChange={onFieldChange}
          isSingleMode={true}
          title={__("Button Layout Setting", "storegrowth-sales-booster")}
        />

        <SelectBox
          name={"checkout_redirect"}
          fieldValue={createDirectCheckoutForm.checkout_redirect}
          changeHandler={onFieldChange}
          title={"Checkout Redirect"}
          tooltip={__(
            "Select the type of checkout redirection",
            "storegrowth-sales-booster"
          )}
          options={selectOptions}
        />

        <SingleCheckBox
          needUpgrade={upgradeTeaser}
          name={"shop_page_checkout_enable"}
          checkedValue={createDirectCheckoutForm.shop_page_checkout_enable}
          className={`settings-field checkbox-field`}
          changeHandler={onFieldChange}
          title={__("Display on Shop Page", "storegrowth-sales-booster")}
          tooltip={__(
            "The direct checkout button will show on the shop page",
            "storegrowth-sales-booster"
          )}
        />
        <SingleCheckBox
          name={"product_page_checkout_enable"}
          checkedValue={createDirectCheckoutForm.product_page_checkout_enable}
          className={`settings-field checkbox-field`}
          changeHandler={onFieldChange}
          title={__("Display on Shop Page", "storegrowth-sales-booster")}
          tooltip={__(
            "The direct checkout button will show on the single product page",
            "storegrowth-sales-booster"
          )}
        />
      </SettingsSection>

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

export default General;
