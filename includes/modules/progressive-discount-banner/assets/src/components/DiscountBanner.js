import { Form, Select, Input, InputNumber } from "antd";
import { RemovableIconPicker } from "./RemovableIconPicker";
import { Fragment } from "react";
import { __ } from "@wordpress/i18n";
import Switcher from "../../../../../../assets/src/components/settings/Panels/PanelSettings/Fields/Switcher";

import SelectBox from "../../../../../../assets/src/components/settings/Panels/PanelSettings/Fields/SelectBox";

function DiscountBanner(props) {
  const { formData, onFieldChange, onIconChange } = props;

  const FreeShippingExtra = (
    <div>
      You need to set up free shipping on{" "}
      <a href="admin.php?page=wc-settings&tab=shipping">
        WooCommerce Shipping Settings
      </a>{" "}
      page.
    </div>
  );

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

  return (
    <Fragment>
        <SelectBox
          name={`discount_type`}
          options={[...discountTypes]}
          // needUpgrade={upgradeTeaser}
          fieldValue={formData.discount_type}
          changeHandler={onFieldChange}
          title={__("Discount Type", "storegrowth-sales-booster")}
        />

        <Form.Item
          label="Discount Type"
          labelAlign="left"
          extra={
            formData.discount_type === "free-shipping"
              ? FreeShippingExtra
              : null
          }
        >
          <Select
            value={formData.discount_type}
            style={{ width: 200 }}
            onChange={(v) => onFieldChange("discount_type", v)}
          >
            <Select.Option value="free-shipping">Free Shipping</Select.Option>
            <Select.Option value="discount-amount">
              Discount Amount
            </Select.Option>
          </Select>
        </Form.Item>

        {formData.discount_type === "discount-amount" && (
          <Form.Item label="Discount Amount Mode" labelAlign="left">
            <Select
              value={formData.discount_amount_mode}
              style={{ width: 200 }}
              onChange={(v) => onFieldChange("discount_amount_mode", v)}
            >
              <Select.Option value="fixed-amount">Fixed Amount</Select.Option>
              <Select.Option value="percentage">Percentage</Select.Option>
            </Select>
          </Form.Item>
        )}

        {formData.discount_type === "discount-amount" && (
          <Form.Item
            label={
              formData.discount_amount_mode == "percentage"
                ? "Discount Percentage"
                : "Discount Amount"
            }
            labelAlign="left"
          >
            <InputNumber
              addonAfter={
                formData.discount_amount_mode == "percentage" ? "%" : null
              }
              addonBefore={
                formData.discount_amount_mode == "fixed-amount"
                  ? sgsbAdmin.currencySymbol
                  : null
              }
              min={0}
              value={formData.discount_amount_value}
              onChange={(v) => onFieldChange("discount_amount_value", v)}
              style={{ width: 150 }}
            />
          </Form.Item>
        )}

        <Form.Item
          label="Cart Minimum Amount"
          labelAlign="left"
          extra="Require minimum amount in customer cart to avail this discount."
        >
          <InputNumber
            min={0}
            addonBefore={sgsbAdmin.currencySymbol}
            value={formData.cart_minimum_amount}
            onChange={(v) => onFieldChange("cart_minimum_amount", v)}
            style={{ width: 150 }}
          />
        </Form.Item>

        <Form.Item
          label="Progressive Banner Text"
          labelAlign="left"
          extra="This banner will be shown to customers when the cart amount is less than the required minimum amount. [amount] will be replaced with the real amount."
        >
          <Input
            value={formData.progressive_banner_text}
            onChange={(e) =>
              onFieldChange("progressive_banner_text", e.target.value)
            }
            placeholder="Add more [amount] to get free shipping."
          />
        </Form.Item>

        <Form.Item
          label="Goal Completion Text"
          labelAlign="left"
          extra="This banner will be shown to customers when the cart amount exceeds the required minimum amount."
        >
          <Input
            value={formData.goal_completion_text}
            onChange={(e) =>
              onFieldChange("goal_completion_text", e.target.value)
            }
            placeholder="You have successfully acquired free shipping."
          />
        </Form.Item>

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
    </Fragment>
  );
}

export default DiscountBanner;
