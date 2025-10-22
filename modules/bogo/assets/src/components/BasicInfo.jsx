import {__} from "@wordpress/i18n";
import {notification} from "antd";
import apiFetch from '@wordpress/api-fetch';
import {useDispatch, useSelect} from "@wordpress/data";
import {Fragment, useEffect, useState} from "react";
import TextInput from "sales-booster/src/components/settings/Panels/PanelSettings/Fields/TextInput";
import SettingsSection from "sales-booster/src/components/settings/Panels/PanelSettings/SettingsSection";
import MultiSelectBox from "sales-booster/src/components/settings/Panels/PanelSettings/Fields/MultiSelectBox";
import SelectBox from "sales-booster/src/components/settings/Panels/PanelSettings/Fields/SelectBox";
import TextRadioBox from "sales-booster/src/components/settings/Panels/PanelSettings/Fields/TextRadioBox";
import OfferField from "./OfferField";
import {applyFilters} from "@wordpress/hooks";
/**
* TODO: Enable BOGO Type, Alternate Products, and BOGO Schedule fields once the backend is ready.
* @see https://github.com/getdokan/plugin-internal-tasks/issues/891
*/
const DISPLAY_FIELDS = {
  bogoType: false,
  alternateProducts: false,
  bogoSchedule: false,
};
const BasicInfo = ({ clearErrors }) => {
  const { setCreateFromData } = useDispatch("spsg_bogo");
  const { createBogoData } = useSelect((select) => ({
    createBogoData: select("spsg_bogo").getCreateFromData(),
  }));
  const offerProductId = parseInt(createBogoData?.get_different_product_field);
  const [originalProductListForSelect, setOriginalProductListForSelect] = useState([])

  const [simpleProductForOffer, setSimpleProductForOffer] = useState([]);
  const [productListForSelect, setProductListForSelect] = useState([]);

  const offerOptions = [
    { value: "free", label: __("Free", "storegrowth-sales-booster-pro") },
    { value: "discount", label: __("Discount%", "storegrowth-sales-booster-pro") },
  ];

  const handleProductSelection = (key, value, list, infoKey) => {
    const product = list.find(item => parseInt(item.value) === parseInt(value));

    setCreateFromData({
        ...createBogoData,
        [infoKey]: {
            name: product?.label || ''
        },
        [key]: value
    });
};

  const onFieldChange = (key, value) => {
    clearErrors();
    // Handle offer amount validation with actual price.
    if (key === "discount_amount") {
      if (createBogoData.offer_type === "discount" && value > 100) {
        return notification["error"]({
          message: __(
            "Discount offer can't be greater than 100 percent!",
            "storegrowth-sales-booster-pro"
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
        message: __("Please select target products first", "storegrowth-sales-booster-pro"),
      });
    }

    if (key === 'offered_products') {
        handleProductSelection(
            key,
            value,
            originalProductListForSelect,
            'get_offered_product_info'
        );
        return;
    }

    if (key === 'get_different_product_field') {
        handleProductSelection(
            key,
            value,
            simpleProductForOffer,
            'get_different_product_info'
        );
        return;
    }

    setCreateFromData({
        ...createBogoData,
        [key]: value,
    });
  };

  const hidePremiumFeature = applyFilters('spsg_hide_bogo_premium_options', true);

  const dealOptions = [
    { key: 'different', value: __('Buy X Get Y', 'storegrowth-sales-booster') },
    { key: 'same', disabled: hidePremiumFeature, needUpgrade: hidePremiumFeature, value: __('Buy X Get X', 'storegrowth-sales-booster') },
  ];

  const dealCategories = [
    { key: 'products', value: __('Products', 'storegrowth-sales-booster') },
    { key: 'categories', disabled: hidePremiumFeature, needUpgrade: hidePremiumFeature, value: __('Categories', 'storegrowth-sales-booster') },
  ];

  function debounce(func, delay) {
      let timeoutId; // This will store the timer ID
      return function(...args) { // Returns a new function that will be debounced
        const context = this; // Preserve the 'this' context

        clearTimeout(timeoutId); // Clear any previous timer

        timeoutId = setTimeout(() => { // Set a new timer
          func.apply(context, args); // Execute the original function after the delay
        }, delay);
      };
  }

  const getProducts = async (query, type = '') => {
      return await apiFetch({
          path: `/sales-booster/v1/products?search=${query}&product_type=${type}`,
      });
  }

  const onOfferProductSearch = debounce(async (value = '') => {
      const response = await getProducts(value);
      const products = response.map(product => {
          return {
              label: product.formatted_name,
              value: product.id,
          }
      })
      setOriginalProductListForSelect(products)
  }, 500)

    const onDifferentProductSearch = debounce(async (value = '') => {
      const response = await getProducts(value, 'simple');
      const products = response.map(product => {
          return {
              label: product.formatted_name,
              value: product.id,
          }
      })
      setSimpleProductForOffer(products)
  }, 500)

  return (
    <Fragment>
      <SettingsSection>
        <TextInput
          fullWidth={true}
          name={`name_of_order_bogo`}
          changeHandler={onFieldChange}
          fieldValue={createBogoData.name_of_order_bogo}
          title={__("Name of BOGO", "storegrowth-sales-booster-pro")}
          placeHolderText={__(
            "Enter BOGO Name",
            "storegrowth-sales-booster-pro"
          )}
        />
        <SelectBox
          colSpan={24}
          showSearch={true}
          fieldWidth={"100%"}
          classes={`search-single-select`}
          name={"offered_products"}
          changeHandler={onFieldChange}
          options={originalProductListForSelect}
          fieldValue={ createBogoData?.get_offered_product_info?.name }
          title={__("Select Target Product(s)", "storegrowth-sales-booster-pro")}
          placeHolderText={__("Search for products", "storegrowth-sales-booster-pro")}
          tooltip={__(
            "The target product indicates for which specific products the upsell order bogo option will be displayed.",
            "storegrowth-sales-booster-pro"
          )}
          filterOption={(inputValue, option) =>
            option?.children?.[0]
              ?.toString()
              ?.toLowerCase()
              ?.includes(inputValue.toLowerCase())
          }
          onSearch={onOfferProductSearch}
          onOpenChange={() => {
            if(!originalProductListForSelect.length) {
             onOfferProductSearch( '');
            }
          }}
        />

        <TextRadioBox
          name={`bogo_deal_type`}
          title={__("BOGO Deal Type", "storegrowth-sales-booster")}
          tooltip={__("this is an example", "storegrowth-sales-booster")}
          options={applyFilters('spsg_bogo_deal_type_options', [...dealOptions])}
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
            title={__("Offer Product", "storegrowth-sales-booster-pro")}
            tooltip={__(
              "The specific product that will be available in the order bogo with an offer.",
              "storegrowth-sales-booster-pro"
            )}
            placeHolderText={__(
              "Search for offer product",
              "storegrowth-sales-booster-pro"
            )}
            fieldValue={ createBogoData?.get_different_product_info?.name }
            filterOption={(inputValue, option) =>
              option?.children?.[0]
                ?.toString()
                ?.toLowerCase()
                ?.includes(inputValue.toLowerCase())
            }
            onSearch={onDifferentProductSearch}
            onOpenChange={() => {
                if(!simpleProductForOffer.length) {
                 onDifferentProductSearch( '');
                }
            }}
          />)
        }

        <OfferField
          createBogoData={createBogoData}
          offerOptions={offerOptions}
          onFieldChange={onFieldChange}
        />

        {applyFilters(
          'spsg_after_bogo_offer_settings',
          '',
          createBogoData,
          onFieldChange
        )}
       {DISPLAY_FIELDS.bogoType && (
        <TextRadioBox
          name={`bogo_type`}
          title={__("Select BOGO Type", "storegrowth-sales-booster-pro")}
          classes={""}
          tooltip={__("this is an example", "storegrowth-sales-booster-pro")}
          options={[...dealCategories]}
          fieldValue={createBogoData?.bogo_type}
          changeHandler={onFieldChange}
        />
        )}
        {DISPLAY_FIELDS.alternateProducts && (
          <>
            {(createBogoData?.bogo_type === "products") ? (
              <MultiSelectBox
                name={"get_alternate_products"}
                changeHandler={onFieldChange}
                options={productListForSelect}
                fieldValue={createBogoData?.get_alternate_products ? createBogoData?.get_alternate_products.map(Number) : []}
                title={__("Alternate option of the offered products", "storegrowth-sales-booster-pro")}
                placeHolderText={__("Search for products", "storegrowth-sales-booster-pro")}
                tooltip={__(
                  "The target product indicates for which specific products the upsell order bogo option will be displayed.",
                  "storegrowth-sales-booster-pro"
                )}
              />
            ) : (
              <Fragment>
                <MultiSelectBox
                  name={"get_alternate_categories"}
                  changeHandler={onFieldChange}
                  fieldValue={createBogoData?.get_alternate_categories ? createBogoData?.get_alternate_categories.map(Number) : []}
                  options={bogo_products_and_categories?.category_list?.catForSelect}
                  title={__("Offer this category product as alternate product for this offer", "storegrowth-sales-booster-pro")}
                  placeHolderText={__("Search for Categories", "storegrowth-sales-booster-pro")}
                  tooltip={__(
                    "The target categories indicate for which specific categories the upsell order bogo option will be displayed.",
                    "storegrowth-sales-booster-pro"
                  )}
                />
              </Fragment>
            )}
            </>
        )}
        {DISPLAY_FIELDS.bogoSchedule &&
          applyFilters(
            'spsg_after_bogo_basic_info_settings',
            '',
            createBogoData,
            onFieldChange,
            productListForSelect
          )}
      </SettingsSection>
    </Fragment>
  );
};

export default BasicInfo;
