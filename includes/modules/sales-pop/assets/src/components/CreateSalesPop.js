import { Button } from 'antd';

import { useDispatch, useSelect } from '@wordpress/data';

import { __ } from "@wordpress/i18n";
import SettingsSection from "../../../../../../assets/src/components/settings/Panels/PanelSettings/SettingsSection";
import Switcher from "../../../../../../assets/src/components/settings/Panels/PanelSettings/Fields/Switcher";
import TextAreaBox from "../../../../../../assets/src/components/settings/Panels/PanelSettings/Fields/TextAreaBox";
import MultiSelectBox from "../../../../../../assets/src/components/settings/Panels/PanelSettings/Fields/MultiSelectBox";
import {createPopupForm, noop} from "../helper";
import {Fragment} from "react";
import ActionsHandler from "sales-booster/src/components/settings/Panels/PanelSettings/ActionsHandler";
import SelectBox from "sales-booster/src/components/settings/Panels/PanelSettings/Fields/SelectBox";

const WarningMessage =({warningColor}) => <span style={{color:warningColor || "#00000099", fontStyle:"italic", marginLeft: '10px'}}>{warningColor ? "warning" : "note" }: cannot select more than 5 items in this version</span>;

function CreateSalesPop( { onFormSave, upgradeTeaser } ) {
  const { setCreateFromData } = useDispatch( 'sgsb_order_sales_pop' );

  const { createPopupFormData, getButtonLoading } = useSelect( ( select ) => ({
    createPopupFormData : select( 'sgsb_order_sales_pop' ).getCreateFromData(),
    getButtonLoading    : select( 'sgsb_order_sales_pop' ).getButtonLoading()
  }) );

  const onFieldChange = ( key, value ) => {
    setCreateFromData( {
      ...createPopupFormData,
      [ key ]: value,
    } );
  };

  const onFormReset = () => {
    setCreateFromData( { ...createPopupForm } );
  }

  const productSources = [
    { value: 0, label: __( 'Get from Billing', 'storegrowth-sales-booster' ) },
    { value: 1, label: __( 'Select Products', 'storegrowth-sales-booster' ) },
    { value: 2, label: __( 'Latest Products', 'storegrowth-sales-booster' ) },
    { value: 3, label: __( 'Select Categories', 'storegrowth-sales-booster' ) },
    { value: 4, label: __( 'Recent Viewed Products', 'storegrowth-sales-booster' ) },
  ];

  const product_categories = Object.entries( sales_pop_data.product_list.categoryListForSelect )?.map(
    ( [ value, label ] ) => ( { value: parseInt( value ), label } )
  );

  const max_option_count_in_free = 5;
  const externalLink = createPopupFormData.external_link;
  const externalProductsIds = sales_pop_data.product_list.externalProductsIds;

  let allProductListForSelect = [];
  if ( createPopupFormData?.product_source === 3 ) {
    const categoryProductIds = Object.entries(
        sales_pop_data.product_list.categoryProductIdsForSelect ).map(
        ( [ categoryId, categoryProductIds ] ) => createPopupFormData.target_categories.includes( parseInt( categoryId ) ) && categoryProductIds
    );

    const uniqueCategoryProductIds = [];
    categoryProductIds.forEach( productIdsArray => Boolean( productIdsArray ) ?
      productIdsArray?.forEach( productId => ! uniqueCategoryProductIds?.includes( productId ) ? uniqueCategoryProductIds?.push( productId ) : '' ) : ''
    )

    allProductListForSelect = sales_pop_data.product_list.productListForSelect?.[ createPopupFormData?.product_source ]?.filter(
      product => uniqueCategoryProductIds?.includes( parseInt( product?.value ) )
    );
  } else {
    allProductListForSelect = sales_pop_data.product_list.productListForSelect?.[ createPopupFormData?.product_source ];
  }

  const selectedPopupProducts = createPopupFormData.popup_products;
  const isProductsSelectReachedlimit = selectedPopupProducts.length >= max_option_count_in_free;
  let productListForSelect = externalLink ? allProductListForSelect : allProductListForSelect.filter(item => !externalProductsIds.includes(item.value));
  productListForSelect = isProductsSelectReachedlimit ? productListForSelect.filter(item => selectedPopupProducts.includes(item.value)) : productListForSelect;

  const selectedVirtualCountries = createPopupFormData.virtual_countries;
  const isCountriesSelectionReachedlimit = selectedVirtualCountries?.length >= max_option_count_in_free;
  let virtualCountriesOptions = createPopupFormData.countries;

  virtualCountriesOptions = isCountriesSelectionReachedlimit ? virtualCountriesOptions.filter(item => selectedVirtualCountries.includes(item.value)) : virtualCountriesOptions;

  const virtualName = createPopupFormData.virtual_name;
  const virtualNameLength = Array.isArray(virtualName) ? virtualName?.length : (virtualName || "")?.split(",")?.length;
  const isFirstNameReachedLimit = virtualNameLength >= max_option_count_in_free;
  const isFirstNameExceededLimit = virtualNameLength >= max_option_count_in_free + 1;

  const virtualLocationPlaceHolder = `New York City, New York, USA\nBernau, Freistaat Bayern, Germany`;

  const virtualLocationsFormVal = createPopupFormData?.virtual_locations;
  const virtualLocationsValue =
    !virtualLocationsFormVal && "" !== virtualLocationsFormVal
      ? virtualLocationPlaceHolder
      : virtualLocationsFormVal;
  
  return (
    <Fragment>
      <SettingsSection>
        <Switcher
          name={ 'external_link' }
          needUpgrade={ upgradeTeaser }
          changeHandler={ onFieldChange }
          isEnable={ Boolean( createPopupFormData.external_link ) }
          title={ __( 'External Link', 'storegrowth-sales-booster' ) }
          tooltip={ __( 'Working with External/Affiliate Products. Product link is product url', 'storegrowth-sales-booster' ) }
        />
        <Switcher
          name={ 'product_random' }
          changeHandler={ onFieldChange }
          isEnable={ Boolean( createPopupFormData.product_random ) }
          title={ __( 'Product Show Random', 'storegrowth-sales-booster' ) }
        />
        <SelectBox
          fieldWidth={ `100%` }
          name={ `product_source` }
          changeHandler={ onFieldChange }
          options={ [ ...productSources ] }
          classes={ `search-single-select` }
          fieldValue={ createPopupFormData.product_source }
          title={ __( 'Product Source', 'storegrowth-sales-booster' ) }
        />
        <MultiSelectBox
          name={ 'popup_products' }
          changeHandler={ onFieldChange }
          options={ productListForSelect }
          fieldValue={ selectedPopupProducts.map( Number ) }
          title={ __( 'Select Popup Products', 'storegrowth-sales-booster' ) }
          placeHolderText={ __( 'Search for products', 'storegrowth-sales-booster' ) }
        />
        { createPopupFormData?.product_source === 3 && (
          <MultiSelectBox
            name={ 'target_categories' }
            changeHandler={ onFieldChange }
            fieldValue={ createPopupFormData.target_categories.map( Number ) }
            options={ product_categories }
            title={ __( 'Select Target Categories', 'storegrowth-sales-booster' ) }
            placeHolderText={ __( 'Search for Categories', 'storegrowth-sales-booster' ) }
          />
        ) }
        {(isFirstNameReachedLimit || isFirstNameExceededLimit) && <WarningMessage warningColor={isFirstNameExceededLimit ? "#f00" : false} />}
        <TextAreaBox
          areaRows={ 3 }
          name={ 'virtual_name' }
          fieldValue={ virtualName }
          changeHandler={ onFieldChange }
          title={ __( 'Virtual First Name', 'storegrowth-sales-booster' ) }
          placeHolderText={ __( 'Name1, Name2, Name3', 'storegrowth-sales-booster' ) }
          tooltip={ __( 'Please use comma(,) separator to insert multiple name', 'storegrowth-sales-booster' ) }
        />
        <TextAreaBox
          areaRows={ 3 }
          name={ 'virtual_locations' }
          changeHandler={ onFieldChange }
          fieldValue={ virtualLocationsValue}
          placeholder={ virtualLocationPlaceHolder }
          title={ __( 'Virtual Location', 'storegrowth-sales-booster' ) }
          placeHolderText={ __( 'New York City, New York, USA\n' +
              'Bernau, Freistaat Bayern, Germany', 'storegrowth-sales-booster' ) }
          tooltip={ __( 'Please write each location on a separate line, following the format: \'city\', \'state\', \'country\'. Use commas to separate the city, state, and country. If you don\'t have a state, leave an empty comma in its place (e.g. city,,country). If you don\'t have a city, leave an empty comma in its place (e.g. ,state,country).', 'storegrowth-sales-booster' ) }
        />
      </SettingsSection>

      <ActionsHandler
        resetHandler={ onFormReset }
        loadingHandler={ getButtonLoading }
        isDisabled={ isFirstNameExceededLimit }
        saveHandler={ () => !isFirstNameExceededLimit && onFormSave( 'product' ) }
      />
    </Fragment>
  );
}

export default CreateSalesPop;
