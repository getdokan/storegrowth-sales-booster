import { __ } from "@wordpress/i18n";
import { Col, notification } from "antd";
import { useDispatch, useSelect } from "@wordpress/data";
import { Fragment } from "react";
import TextInput from "sales-booster/src/components/settings/Panels/PanelSettings/Fields/TextInput";
import SettingsSection from "sales-booster/src/components/settings/Panels/PanelSettings/SettingsSection";
import MultiSelectBox from "sales-booster/src/components/settings/Panels/PanelSettings/Fields/MultiSelectBox";
import SectionHeader from "sales-booster/src/components/settings/Panels/SectionHeader";
import SelectBox from "sales-booster/src/components/settings/Panels/PanelSettings/Fields/SelectBox";
import TextRadioBox from "sales-booster/src/components/settings/Panels/PanelSettings/Fields/TextRadioBox";
import OfferField from "./OfferField";

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

  const targetProducts = createBogoData.target_products;
  const originalSimpleProductForOffer =
    products_and_categories.product_list.simpleProductForOffer;
  const simpleProductForOffer =
    Array.isArray(targetProducts) && targetProducts.length !== 0
      ? originalSimpleProductForOffer.filter(
          (item) => !targetProducts.includes(item.value)
        )
      : originalSimpleProductForOffer;
  const bumpSchedules = [
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
    { value: "discount", label: __("Discount%", "storegrowth-sales-booster") },
    { value: "price", label: __("Price", "storegrowth-sales-booster") },
  ];

  const filterByValue = (data, key) => {
    const item = data.find((item) => item.value === key);
    return item ? item.label : "Value not found";
  };

  const onFieldChange = (key, value) => {
    clearErrors();
    // Handle offer amount validation with actual price.
    if (key === "offer_amount") {
      const product = simpleProductForOffer.find(
        (item) => item?.value === offerProductId
      );
      const currencySymbol = product?.currency;
      const productPrice = product?.price?.replace(
        new RegExp("[" + currencySymbol + ",]", "g"),
        ""
      );
      if (
        createBogoData.offer_type === "price" &&
        parseFloat(productPrice) < value
      ) {
        return notification["error"]({
          message: __(
            "Offer price can't be greater than product price!",
            "storegrowth-sales-booster"
          ),
        });
      }

      if (createBogoData.offer_type === "discount" && value > 100) {
        return notification["error"]({
          message: __(
            "Discount offer can't be greater than 100 percent!",
            "storegrowth-sales-booster"
          ),
        });
      }
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
  };

  const dealOptions = [
    { key: 'bxgy', value: "Buy X Get Y" },
    { key: 'bxgx', value: "Buy X Get X" },
  ];
  const dealCategories = [
    { key: 'products', value: "Products" },
    { key: 'categories', value: "Categories" },
  ];
  return (
    <Fragment>
      <SettingsSection>
        <TextInput
          fullWidth={true}
          name={`name_of_order_bump`}
          changeHandler={onFieldChange}
          fieldValue={createBogoData.name_of_order_bump}
          title={__("Name of Order Bump", "storegrowth-sales-booster")}
          placeHolderText={__(
            "Enter Order Bump Name",
            "storegrowth-sales-booster"
          )}
        />
        <TextRadioBox
            name={`bogo-deal-tyle`}
            title={__("Deal Type",'storegrowth-sales-booster')}
            classes={""}
            tooltip={__("this is an example","storegrowth-sales-booster")}
            options={[...dealOptions]}
            // fieldWidth={true}
            // fieldValue={}
            // changeHandler={}
        />

        <TextRadioBox
            name={`bogo-deal-categories`}
            title={__("Deal Categories",'storegrowth-sales-booster')}
            classes={""}
            tooltip={__("this is an example","storegrowth-sales-booster")}
            options={[...dealCategories]}
            // fieldWidth={true}
            // fieldValue={}
            // changeHandler={}
        />
        <MultiSelectBox
          name={"target_products"}
          changeHandler={onFieldChange}
          options={productListForSelect}
          fieldValue={createBogoData.target_products.map(Number)}
          title={__("Select Target Product(s)", "storegrowth-sales-booster")}
          placeHolderText={__(
            "Search for products",
            "storegrowth-sales-booster"
          )}
          tooltip={__(
            "The target product indicates for which specific products the upsell order bump option will be displayed.",
            "storegrowth-sales-booster"
          )}
        />
        <MultiSelectBox
          name={"target_categories"}
          changeHandler={onFieldChange}
          fieldValue={createBogoData.target_categories.map(Number)}
          options={products_and_categories.category_list.catForSelect}
          title={__("Select Target Categories", "storegrowth-sales-booster")}
          placeHolderText={__(
            "Search for Categories",
            "storegrowth-sales-booster"
          )}
          tooltip={__(
            "The target categories indicates for which specific categories the upsell order bump option will be displayed.",
            "storegrowth-sales-booster"
          )}
        />
        <MultiSelectBox
          name={"bump_schedule"}
          options={bumpSchedules}
          changeHandler={onFieldChange}
          fieldValue={createBogoData.bump_schedule}
          title={__("Order Bump Schedule", "storegrowth-sales-booster")}
          placeHolderText={__(
            "Please select bump schedule",
            "storegrowth-sales-booster"
          )}
          tooltip={__(
            "The schedule can be daily or on specific days of the week.",
            "storegrowth-sales-booster"
          )}
        />
      </SettingsSection>
      <SectionHeader title={__("Offer Section", "storegrowth-sales-booster")} />
      <SettingsSection>
        <SelectBox
          colSpan={24}
          showSearch={true}
          fieldWidth={"100%"}
          name={`offer_product`}
          changeHandler={onFieldChange}
          options={simpleProductForOffer}
          classes={`search-single-select`}
          title={__("Offer Product", "storegrowth-sales-booster")}
          tooltip={__(
            "The specific product that will be available in the order bump with an offer.",
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
        />
        <Col className="gutter-row" span={24}>
          <OfferField
            createBogoData={createBogoData}
            offerOptions={offerOptions}
            onFieldChange={onFieldChange}
          />
        </Col>
      </SettingsSection>
    </Fragment>
  );
};

export default BasicInfo;
