import { Form} from "antd";
import { RemovableIconPicker } from "./RemovableIconPicker";
import { Fragment } from "react";
import { __ } from "@wordpress/i18n";
import SelectBox from "../../../../../../assets/src/components/settings/Panels/PanelSettings/Fields/SelectBox";
import Number from "../../../../../../assets/src/components/settings/Panels/PanelSettings/Fields/Number";
import TextAreaBox from "../../../../../../assets/src/components/settings/Panels/PanelSettings/Fields/TextAreaBox";
import SettingsSection from "../../../../../../assets/src/components/settings/Panels/PanelSettings/SettingsSection";

function DiscountBanner(props) {
  const { formData, onFieldChange, onIconChange } = props;

  const discountTypes = [
    {
      value: "free-shipping",
      label: __("Free Shipping", "storegrowth-sales-booster"),
    },
    {
      value: "discount-amount",
      label: __("Discount Amount", "storegrowth-sales-booster"),
    },
  ];
  const discountModes = [
    {
      value: "fixed-amount",
      label: __("Fixed Amount", "storegrowth-sales-booster"),
    },
    {
      value: "percentage",
      label: __("Percentage", "storegrowth-sales-booster"),
    },
  ];
  const { discount_amount_mode } = formData;
  const discount_mode_text =
    discount_amount_mode === "fixed-amount" ? "Amount" : "Percentage";
  const discount_mode_symbol =
    discount_amount_mode === "fixed-amount" ? sgsbAdmin.currencySymbol : "%";
  return (
    <SettingsSection>
      <SelectBox
        name={`discount_type`}
        options={[...discountTypes]}
        fieldValue={formData.discount_type}
        changeHandler={onFieldChange}
        title={__("Discount Type", "storegrowth-sales-booster")}
        tooltip={__(
          `Choose 'Free Shipping' for shipping discounts or 'Discount Amount' for product price reductions.`,
          "storegrowth-sales-booster"
        )}
      />
      {formData.discount_type === "discount-amount" && (
        <Fragment>
          <SelectBox
            colSpan={12}
            name={`discount_amount_mode`}
            options={[...discountModes]}
            fieldValue={formData.discount_amount_mode}
            changeHandler={onFieldChange}
            title={__("Discount Mode", "storegrowth-sales-booster")}
          />
          <Number
            colSpan={12}
            min={1}
            max={100}
            style={{
              width: "100px",
            }}
            addonBefore={`${discount_mode_symbol}`}
            name={`discount_amount_value`}
            changeHandler={onFieldChange}
            fieldValue={formData.discount_amount_value}
            title={__(
              `Discount ${discount_mode_text}`,
              "storegrowth-sales-booster"
            )}
          />
        </Fragment>
      )}

      <Number
        min={1}
        max={100}
        addonBefore={`${sgsbAdmin.currencySymbol}`}
        name={`cart_minimum_amount`}
        changeHandler={onFieldChange}
        fieldValue={formData.cart_minimum_amount}
        title={__("Cart Minimum Amount", "storegrowth-sales-booster")}
        placeHolderText={__(
          "Require minimum amount in customer cart to avail this discount.",
          "storegrowth-sales-booster"
        )}
        tooltip={__(
          "Require minimum amount in customer cart to avail this discount.",
          "storegrowth-sales-booster"
        )}
      />

      <TextAreaBox
        areaRows={3}
        colSpan={24}
        name={"progressive_banner_text"}
        fieldValue={formData.progressive_banner_text}
        changeHandler={onFieldChange}
        title={__("Banner Text", "storegrowth-sales-booster")}
        placeHolderText={__(
          `Add more [amount] to get free shipping.`,
          "storegrowth-sales-booster"
        )}
        tooltip={__(
          "This banner will be shown to customers when the cart amount is less than the required minimum amount. [amount] will be replaced with the real amount.",
          "storegrowth-sales-booster"
        )}
      />
      <TextAreaBox
        areaRows={3}
        colSpan={24}
        name={"goal_completion_text"}
        fieldValue={formData.goal_completion_text}
        changeHandler={onFieldChange}
        title={__("Goal Completion Text", "storegrowth-sales-booster")}
        placeHolderText={__(
          `You have successfully acquired free shipping.`,
          "storegrowth-sales-booster"
        )}
        tooltip={__(
          "This banner will be shown to customers when the cart amount exceeds the required minimum amount.",
          "storegrowth-sales-booster"
        )}
      />

      <Form.Item label="Progressive Banner Icon" labelAlign="left">
        <RemovableIconPicker
          onClear={(v) =>
            onIconChange(
              "progressive_banner_icon_name",
              "progressive_banner_icon_html",
              ""
            )
          }
          onChange={(v) =>
            onIconChange(
              "progressive_banner_icon_name",
              "progressive_banner_icon_html",
              v
            )
          }
          value={formData.progressive_banner_icon_name}
        />
      </Form.Item>
    </SettingsSection>
  );
}

export default DiscountBanner;
