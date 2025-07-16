import { useDispatch, useSelect } from '@wordpress/data';

import { __ } from "@wordpress/i18n";
import { applyFilters } from '@wordpress/hooks';
import SettingsSection from "../../../../../../assets/src/components/settings/Panels/PanelSettings/SettingsSection";
import Switcher from "../../../../../../assets/src/components/settings/Panels/PanelSettings/Fields/Switcher";
import TextAreaBox from "../../../../../../assets/src/components/settings/Panels/PanelSettings/Fields/TextAreaBox";
import MultiSelectBox from "../../../../../../assets/src/components/settings/Panels/PanelSettings/Fields/MultiSelectBox";
import { createPopupForm } from "../helper";
import { Fragment } from "react";
import ActionsHandler from "sales-booster/src/components/settings/Panels/PanelSettings/ActionsHandler";
import SelectBox from "sales-booster/src/components/settings/Panels/PanelSettings/Fields/SelectBox";
import OrderProductCount from "sales-booster/src/components/settings/Panels/PanelSettings/Fields/Number";

const WarningMessage =({warningColor}) => <span style={{color:warningColor || "#00000099", fontStyle:"italic", marginLeft: '10px'}}>{warningColor ? "warning" : "note" }: Upgrade to add more than 5 names</span>;

function CreateSalesPop( { onFormSave, upgradeTeaser } ) {
  const { setCreateFromData } = useDispatch( 'sgsb_order_sales_pop' );

  const { createPopupFormData, getButtonLoading } = useSelect( ( select ) => ({
    createPopupFormData : select( 'sgsb_order_sales_pop' ).getCreateFromData(),
    getButtonLoading    : select( 'sgsb_order_sales_pop' ).getButtonLoading()
  }) );

  const onFormReset = () => {
    setCreateFromData( { ...createPopupForm } );
  }

  const productSources = [
    { value: 0, label: __( 'Latest Orders', 'storegrowth-sales-booster' ) },
    { value: 1, label: __( 'Select Products', 'storegrowth-sales-booster' ) },
  ];

  const max_option_count_in_free = 5;
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
  const isProductsSelectReachedlimit = upgradeTeaser?selectedPopupProducts.length >= max_option_count_in_free:false;

  // Handle selection available product list.
  let productListForSelect = applyFilters(
    'sgsb_sales_pop_selection_available_product_list',
    allProductListForSelect.filter( item => !externalProductsIds.includes( item.value ) ),
    allProductListForSelect,
    createPopupFormData
  );

  productListForSelect = isProductsSelectReachedlimit ? productListForSelect.filter(item => selectedPopupProducts.includes(item.value)) : productListForSelect;

  const selectedVirtualCountries = createPopupFormData.virtual_countries;
  const isCountriesSelectionReachedlimit = selectedVirtualCountries?.length >= max_option_count_in_free;
  let virtualCountriesOptions = createPopupFormData.countries;

  virtualCountriesOptions = isCountriesSelectionReachedlimit ? virtualCountriesOptions.filter(item => selectedVirtualCountries.includes(item.value)) : virtualCountriesOptions;

  const virtualName = createPopupFormData.virtual_name;
  const virtualNameLength = Array.isArray(virtualName) ? virtualName?.length : (virtualName || "")?.split(",")?.length;
  const isFirstNameReachedLimit = upgradeTeaser?virtualNameLength >= max_option_count_in_free:false;
  const isFirstNameExceededLimit = upgradeTeaser?virtualNameLength >= max_option_count_in_free + 1:false;

  const virtualLocationPlaceHolder = `New York City, New York, USA\nBernau, Freistaat Bayern, Germany`;

  const virtualLocationsFormVal = createPopupFormData?.virtual_locations;
  const virtualLocationsValue =
    !virtualLocationsFormVal && "" !== virtualLocationsFormVal
      ? virtualLocationPlaceHolder
      : virtualLocationsFormVal;

    const onFieldChange = ( key, value ) => {
      const formData = {
        ...createPopupFormData,
        [ key ]: value,
      };

      // Handle number of orders for latest product.
      if ( key === 'number_of_orders' ) {
        formData.popup_products = productListForSelect?.slice(0, value)
          ?.map( product => product?.value );
      }

      // Reset source infos when source changed.
      if ( key === 'product_source' ) {
        formData.popup_products = [];
        formData.number_of_orders = 0;
      }

      setCreateFromData( { ...formData } );
    };
  
  return (
    <Fragment>
      <SettingsSection>
        {/* Rendered all necessary sales pop settings before product settings. */}
        { applyFilters(
          'sgsb_prepend_sales_pop_product_settings',
          '',
          createPopupFormData,
          onFieldChange
        ) }
        <Switcher
          name={ 'product_random' }
          changeHandler={ onFieldChange }
          isEnable={ Boolean( createPopupFormData.product_random ) }
          title={ __( 'Product Show Random', 'storegrowth-sales-booster' ) }
          tooltip={ __( 'Selected products will show randomly instead of showing sequentially.', 'storegrowth-sales-booster' ) }
        />
        <SelectBox
          fieldWidth={ `100%` }
          name={ `product_source` }
          changeHandler={ onFieldChange }
          options={ [ ...productSources ] }
          classes={ `search-single-select` }
          fieldValue={ productSources?.[ createPopupFormData.product_source ] }
          title={ __( 'Product Source', 'storegrowth-sales-booster' ) }
          tooltip={ __( 'The source of the products that are to be shown in the sales pop.', 'storegrowth-sales-booster' ) }
        />
        { parseInt( createPopupFormData?.product_source ) === 0 && (
          <OrderProductCount
            min={ 0 }
            name={ `number_of_orders` }
            fieldValue={ createPopupFormData.number_of_orders }
            max={ productListForSelect?.length }
            disabled={ !productListForSelect?.length }
            changeHandler={ onFieldChange }
            title={  __( 'Number of Orders', 'storegrowth-sales-booster' ) }
            style={ { width: 100, padding: '4px 0' } }
            tooltip={ __( 'Number of latest orders that are to be shown in the sales pop.', 'storegrowth-sales-booster' ) }
          />
        ) }

        { parseInt( createPopupFormData?.product_source ) === 1 && (
          <MultiSelectBox
            name={ 'popup_products' }
            changeHandler={ onFieldChange }
            options={ productListForSelect }
            fieldValue={ selectedPopupProducts?.map( Number ) }
            needUpgrade={ isProductsSelectReachedlimit? upgradeTeaser : false }
            title={ __( 'Select Popup Products', 'storegrowth-sales-booster' ) }
            placeHolderText={ __( 'Search for products', 'storegrowth-sales-booster' ) }
            tooltip={ __( 'The selected products that are to be shown in the sales pop.', 'storegrowth-sales-booster' ) }
          />
        ) }
        {(isFirstNameReachedLimit || isFirstNameExceededLimit) && <WarningMessage warningColor={isFirstNameExceededLimit ? "#f00" : false} />}
        <TextAreaBox
          areaRows={ 3 }
          name={ 'virtual_name' }
          fieldValue={ virtualName }
          upgradeOverlay={false}
          needUpgrade={isFirstNameExceededLimit}
          inputRestrictor={isFirstNameExceededLimit}
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

        {/* Rendered all necessary sales pop settings after product settings. */}
        { applyFilters(
          'sgsb_append_sales_pop_product_settings',
          '',
          createPopupFormData,
          onFieldChange
        ) }
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
