import { __ } from "@wordpress/i18n";
import { notification } from "antd";
import { useDispatch, useSelect } from "@wordpress/data";
import { Fragment, useState, useEffect } from "react";
import TextInput from "sales-booster/src/components/settings/Panels/PanelSettings/Fields/TextInput";
import SettingsSection from "sales-booster/src/components/settings/Panels/PanelSettings/SettingsSection";
import MultiSelectBox from "sales-booster/src/components/settings/Panels/PanelSettings/Fields/MultiSelectBox";
import SelectBox from "sales-booster/src/components/settings/Panels/PanelSettings/Fields/SelectBox";
import TextRadioBox from "sales-booster/src/components/settings/Panels/PanelSettings/Fields/TextRadioBox";
import OfferField from "./OfferField";
import DateField from "sales-booster/src/components/settings/Panels/PanelSettings/Fields/DateField";
import { InputNumber } from "sales-booster/src/components/settings/Panels";
import {applyFilters} from "@wordpress/hooks";

const BasicInfo = ({ clearErrors }) => {
  const { setCreateFromData } = useDispatch("sgsb_bogo");
  const { createBogoData } = useSelect((select) => ({
    createBogoData: select("sgsb_bogo").getCreateFromData(),
  }));

  const offerProductId = parseInt(createBogoData?.get_different_product_field);
  const originalProductListForSelect =
    products_and_categories.product_list.productListForSelect;

  const [simpleProductForOffer, setSimpleProductForOffer] = useState([]);
  const [productListForSelect, setProductListForSelect] = useState([]);

  const targetProducts = createBogoData?.offered_products;
  const originalSimpleProductForOffer =
    products_and_categories.product_list.simpleProductForOffer;

    useEffect(() => {
      if (targetProducts !== "") {
        const updatedOfferProducts = originalSimpleProductForOffer.filter(
          item => item.value !== parseInt(targetProducts)
        );
        const updatedProductListForSelect = originalProductListForSelect.filter(
          item => item.value !== offerProductId && item.value !== parseInt(targetProducts)
        );
    
        setSimpleProductForOffer(updatedOfferProducts);
        setProductListForSelect(updatedProductListForSelect);
      } else {
        setSimpleProductForOffer(originalSimpleProductForOffer);
        setProductListForSelect(originalProductListForSelect);
      }
    }, [targetProducts, originalSimpleProductForOffer, originalProductListForSelect, offerProductId]);

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
      (key === "get_different_product_field" || key === "get_alternate_products") &&
      createBogoData?.bogo_type === "products" && // Check if the deal type is 'same'
      createBogoData?.offered_products.length === 0 // Check if no target products are selected
    ) {
      return notification["error"]({
        message: __("Please select target products first", "storegrowth-sales-booster"),
      });
    }

    if (key === "get_different_product_field") {
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

  const hidePremiumFeature = applyFilters( 'sgsb_hide_bogo_premium_options', true );

  const dealOptions = [
    { key: 'different', value: __('Buy X Get Y', 'storegrowth-sales-booster') },
    { key: 'same', disabled: hidePremiumFeature, value: __('Buy X Get X', 'storegrowth-sales-booster') },
  ];

  const dealCategories = [
    { key: 'products', value: __('Products', 'storegrowth-sales-booster') },
    { key: 'categories', disabled: hidePremiumFeature, value: __('Categories', 'storegrowth-sales-booster') },
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
          filterOption={(inputValue, option) =>
            option?.children?.[0]
              ?.toString()
              ?.toLowerCase()
              ?.includes(inputValue.toLowerCase())
          }
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
            name={`get_different_product_field`}
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
          />)
        }

        <OfferField
          createBogoData={createBogoData}
          offerOptions={offerOptions}
          onFieldChange={onFieldChange}
        />

        {applyFilters(
          'sgsb_after_bogo_offer_settings',
          '',
          createBogoData,
          onFieldChange
        )}

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

        {applyFilters(
          'sgsb_after_bogo_basic_info_settings',
          '',
          createBogoData,
          onFieldChange
        )}
      </SettingsSection>
    </Fragment>
  );
};

export default BasicInfo;
