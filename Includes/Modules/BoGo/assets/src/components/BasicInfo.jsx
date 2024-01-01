import { __ } from "@wordpress/i18n";
import { notification } from "antd";
import { useDispatch, useSelect } from "@wordpress/data";
import { Fragment } from "react";
import TextInput from "sales-booster/src/components/settings/Panels/PanelSettings/Fields/TextInput";
import SettingsSection from "sales-booster/src/components/settings/Panels/PanelSettings/SettingsSection";
import MultiSelectBox from "sales-booster/src/components/settings/Panels/PanelSettings/Fields/MultiSelectBox";
import SelectBox from "sales-booster/src/components/settings/Panels/PanelSettings/Fields/SelectBox";
import TextRadioBox from "sales-booster/src/components/settings/Panels/PanelSettings/Fields/TextRadioBox";
import OfferField from "./OfferField";
import DateField from "sales-booster/src/components/settings/Panels/PanelSettings/Fields/DateField";
import { InputNumber } from "sales-booster/src/components/settings/Panels";

const BasicInfo = ({ clearErrors }) => {
  const { setCreateFromData } = useDispatch("sgsb_bogo");
  const { createBogoData } = useSelect((select) => ({
    createBogoData: select("sgsb_bogo").getCreateFromData(),
  }));

  const offerProductId = parseInt(createBogoData?.offer_product);
  const originalProductListForSelect =
    products_and_categories.product_list.productListForSelect;
  const productListForSelect = offerProductId
    ? originalProductListForSelect.filter(
      (item) => item.value !== offerProductId
    )
    : originalProductListForSelect;

  const targetProducts = createBogoData.offered_products;
  const originalSimpleProductForOffer =
    products_and_categories.product_list.simpleProductForOffer;
  const simpleProductForOffer =
    Array.isArray(targetProducts) && targetProducts.length !== 0
      ? originalSimpleProductForOffer.filter(
        (item) => !targetProducts.includes(item.value)
      )
      : originalSimpleProductForOffer;
  const bogoSchedules = [
    { value: "daily", label: __("Daily", "storegrowth-sales-booster") },
    { value: "saturday", label: __("Saturday", "storegrowth-sales-booster") },
    { value: "sunday", label: __("Sunday", "storegrowth-sales-booster") },
    { value: "monday", label: __("Monday", "storegrowth-sales-booster") },
    { value: "tuesday", label: __("Tuesday", "storegrowth-sales-booster") },
    { value: "wednesday", label: __("Wednesday", "storegrowth-sales-booster") },
    { value: "thursday", label: __("Thursday", "storegrowth-sales-booster") },
    { value: "friday", label: __("Friday", "storegrowth-sales-booster") },
  ];

  const offerOptions = [
    { value: "free", label: __("Free", "storegrowth-sales-booster") },
    { value: "discount", label: __("Discount%", "storegrowth-sales-booster") },
  ];

  const filterByValue = (data, key) => {
    const item = data.find((item) => item.value === key);
    return item ? item.label : "Value not found";
  };

  const onFieldChange = (key, value) => {
    clearErrors();
    // Handle offer amount validation with actual price.
    if (key === "discount_amount") {
      if (createBogoData.offer_type === "discount" && value > 100) {
        return notification["error"]({
          message: __(
            "Discount offer can't be greater than 100 percent!",
            "storegrowth-sales-booster"
          ),
        });
      }
    }

    if (
      (key === "offer_product" || key === "get_alternate_products") &&
      createBogoData?.bogo_pro_cat_type === "products" && // Check if the deal type is 'same'
      createBogoData?.offered_products.length === 0 // Check if no target products are selected
    ) {
      return notification["error"]({
        message: __("Please select target products first", "storegrowth-sales-booster"),
      });
    }

    if (key === "offer_product") {
      setCreateFromData({
        ...createBogoData,
        [key]: value,
        offer_image_url:
          products_and_categories.product_list_for_view[value].image_url,
        offer_product_title:
          products_and_categories.product_list_for_view[value].post_title,
        offer_product_regular_price:
          products_and_categories.product_list_for_view[value].regular_price,
      });
    } else {
      setCreateFromData({
        ...createBogoData,
        [key]: value,
      });
    }
    const selectedTargetProduct = productListForSelect.find(
      (product) => product && product.value === value
    );

    if (selectedTargetProduct) {
      const updatedOfferProducts = originalSimpleProductForOffer.filter(
        (item) => item.value !== selectedTargetProduct.value
      );

      setCreateFromData({
        ...createBogoData,
        [key]: value,
        simpleProductForOffer: updatedOfferProducts,
      });
    }

  };

  const dealOptions = [
    { key: 'same', value: __('Buy X Get X', 'storegrowth-sales-booster') },
    { key: 'different', value: __('Buy X Get Y', 'storegrowth-sales-booster') },
  ];

  const dealCategories = [
    { key: 'products', value: __('Products', 'storegrowth-sales-booster') },
    { key: 'categories', value: __('Categories', 'storegrowth-sales-booster') },
  ];

  return (
    <Fragment>
      <SettingsSection>
        <TextInput
          fullWidth={true}
          name={`name_of_order_bogo`}
          changeHandler={onFieldChange}
          fieldValue={createBogoData.name_of_order_bogo}
          title={__("Name of BOGO", "storegrowth-sales-booster")}
          placeHolderText={__(
            "Enter BOGO Name",
            "storegrowth-sales-booster"
          )}
        />
        <SelectBox
          colSpan={24}
          showSearch={true}
          fieldWidth={"100%"}
          classes={`search-single-select`}
          name={"offered_products"}
          changeHandler={onFieldChange}
          options={productListForSelect}
          fieldValue={createBogoData?.offered_products ? createBogoData?.offered_products : ''}
          title={__("Select Target Product(s)", "storegrowth-sales-booster")}
          placeHolderText={__("Search for products", "storegrowth-sales-booster")}
          tooltip={__(
            "The target product indicates for which specific products the upsell order bogo option will be displayed.",
            "storegrowth-sales-booster"
          )}
        />

        <TextRadioBox
          name={`bogo_deal_type`}
          title={__("BOGO Deal Type", "storegrowth-sales-booster")}
          classes={""}
          tooltip={__("this is an example", "storegrowth-sales-booster")}
          options={[...dealOptions]}
          fieldValue={createBogoData?.bogo_deal_type}
          changeHandler={onFieldChange}
        />

        {createBogoData?.bogo_deal_type !== "same" &&
          (<SelectBox
            colSpan={24}
            showSearch={true}
            fieldWidth={"100%"}
            name={`offer_product`}
            changeHandler={onFieldChange}
            options={simpleProductForOffer}
            classes={`search-single-select`}
            title={__("Offer Product", "storegrowth-sales-booster")}
            tooltip={__(
              "The specific product that will be available in the order bogo with an offer.",
              "storegrowth-sales-booster"
            )}
            placeHolderText={__(
              "Search for offer product",
              "storegrowth-sales-booster"
            )}
            fieldValue={
              offerProductId
                ? filterByValue(simpleProductForOffer, offerProductId)
                : null
            }
            filterOption={(inputValue, option) =>
              option?.children?.[0]
                ?.toString()
                ?.toLowerCase()
                ?.includes(inputValue.toLowerCase())
            }
          />)}

        <OfferField
          createBogoData={createBogoData}
          offerOptions={offerOptions}
          onFieldChange={onFieldChange}
        />

        <InputNumber
          min={1}
          name={"minimum_quantity_required"}
          title={__("Select Min Quantity", "storegrowth-sales-booster")}
          tooltip={__("Minimum add to cart", "storegrowth-sales-booster")}
          fieldValue={createBogoData?.minimum_quantity_required}
          changeHandler={onFieldChange}
        />

        <TextRadioBox
          name={`bogo_type`}
          title={__("Select BOGO Type", "storegrowth-sales-booster")}
          classes={""}
          tooltip={__("this is an example", "storegrowth-sales-booster")}
          options={[...dealCategories]}
          fieldValue={createBogoData?.bogo_type}
          changeHandler={onFieldChange}
        />

        {(createBogoData?.bogo_type === "products") ? (
          <MultiSelectBox
            name={"get_alternate_products"}
            changeHandler={onFieldChange}
            options={productListForSelect}
            fieldValue={createBogoData?.get_alternate_products ? createBogoData?.get_alternate_products.map(Number) : []}
            title={__("Alternate option of the offered products", "storegrowth-sales-booster")}
            placeHolderText={__("Search for products", "storegrowth-sales-booster")}
            tooltip={__(
              "The target product indicates for which specific products the upsell order bogo option will be displayed.",
              "storegrowth-sales-booster"
            )}
          />
        ) : (
          <MultiSelectBox
            name={"get_alternate_categories"}
            changeHandler={onFieldChange}
            fieldValue={createBogoData?.get_alternate_categories ? createBogoData?.get_alternate_categories.map(Number) : []}
            options={products_and_categories.category_list.catForSelect}
            title={__("Offer this category product as alternate product for this offer", "storegrowth-sales-booster")}
            placeHolderText={__("Search for Categories", "storegrowth-sales-booster")}
            tooltip={__(
              "The target categories indicate for which specific categories the upsell order bogo option will be displayed.",
              "storegrowth-sales-booster"
            )}
          />
        )}

        {/* <MultiSelectBox
          name={"get_alternate_products"}
          changeHandler={onFieldChange}
          fieldValue={createBogoData?.get_alternate_products.map(Number)}
          options={simpleProductForOffer}
          title={__("Select Alternate Offer Product", "storegrowth-sales-booster")}
          placeHolderText={__(
            "Search for Alternate Offer",
            "storegrowth-sales-booster"
          )}
          tooltip={__(
            "This will show the alternate offer product.",
            "storegrowth-sales-booster"
          )}
        /> */}

        <MultiSelectBox
          name={"offer_schedule"}
          options={bogoSchedules}
          changeHandler={onFieldChange}
          fieldValue={createBogoData?.offer_schedule}
          title={__("BOGO Schedule", "storegrowth-sales-booster")}
          placeHolderText={__(
            "Please select bogo schedule",
            "storegrowth-sales-booster"
          )}
          tooltip={__(
            "The schedule can be daily or on specific days of the week.",
            "storegrowth-sales-booster"
          )}
        />
        <DateField
          name={"offer_start"}
          title={__("Offer Start", "storegrowth-sales-booster")}
          tooltip={__("Offer Start", "storegrowth-sales-booster")}
          fieldValue={createBogoData?.offer_start}
          changeHandler={onFieldChange}
          fullWidth={true}
        />
        <DateField
          name={"offer_end"}
          title={__("Offer End", "storegrowth-sales-booster")}
          tooltip={__("Offer End", "storegrowth-sales-booster")}
          fieldValue={createBogoData?.offer_end}
          endDateDisable={true}
          startDateValue={createBogoData?.offer_start}
          changeHandler={onFieldChange}
          fullWidth={true}
        />
      </SettingsSection>
    </Fragment>
  );
};

export default BasicInfo;
