import { Fragment } from "react";
import { __ } from "@wordpress/i18n";
import { applyFilters } from '@wordpress/hooks';
import { useDispatch, useSelect } from "@wordpress/data";
import CheckboxGroup from "../../../../../../assets/src/components/settings/Panels/PanelSettings/Fields/CheckboxGroup";
import SingleCheckBox from "../../../../../../assets/src/components/settings/Panels/PanelSettings/Fields/SingleCheckBox";
import SettingsSection from "../../../../../../assets/src/components/settings/Panels/PanelSettings/SettingsSection";
import ActionsHandler from "sales-booster/src/components/settings/Panels/PanelSettings/ActionsHandler";
import { createDirectCheckoutForm } from "../helper";

function General({ onFormSave, upgradeTeaser }) {
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

  let buttonLayoutOptions = [
    {
      label: `"${createDirectCheckoutFormData.buy_now_button_label}" with "Add to cart"`,
      value: "cart-with-buy-now",
      tooltip: __( "", 'storegrowth-sales-booster' ),
    },
    {
      label: `Default Add to cart`,
      value: "default-add-to-cart",
      tooltip: __("", "storegrowth-sales-booster"),
    },
  ];

  buttonLayoutOptions = applyFilters(
    'sgsb_direct_checkout_button_layout_options',
    buttonLayoutOptions,
    createDirectCheckoutFormData
  );

  // Define select options.
  let checkoutPageOptions = [
    {
      label: __("Legacy Checkout", "storegrowth-sales-booster"),
      value: "legacy-checkout",
      tooltip: __(
        "The Chekout will redirect to the default checkout page.",
        "storegrowth-sales-booster"
      ),
    },
  ];

  checkoutPageOptions = applyFilters(
    'sgsb_direct_checkout_page_options',
    checkoutPageOptions,
    isQuickCartActive
  );

  return (
    <Fragment>
      <SettingsSection>
        {/* Rendered direct checkout settings. */}
        { applyFilters(
          'sgsb_prepend_direct_checkout_settings',
          '',
          createDirectCheckoutFormData,
          onFieldChange
        ) }

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

        {/* Rendered direct checkout buy now settings instructions. */}
        { applyFilters(
          'sgsb_after_direct_checkout_buy_now_settings',
          '',
          createDirectCheckoutFormData
        ) }

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
          {/* Rendered direct checkout settings. */}
          { applyFilters(
            'sgsb_inside_direct_checkout_redirection_settings',
            '',
            isQuickCartActive
          ) }
        </CheckboxGroup>

        {/* Rendered sales pop action settings. */}
        { applyFilters(
          'sgsb_direct_checkout_before_product_page_settings',
          '',
          createDirectCheckoutFormData,
          onFieldChange
        ) }

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
    </Fragment>
  );
}

export default General;
