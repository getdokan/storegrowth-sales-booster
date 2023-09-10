import { Button } from 'antd';

import { useDispatch, useSelect } from '@wordpress/data';

import { __ } from "@wordpress/i18n";
import SettingsSection from "../../../../../../assets/src/components/settings/Panels/PanelSettings/SettingsSection";
import Switcher from "../../../../../../assets/src/components/settings/Panels/PanelSettings/Fields/Switcher";
import TextAreaBox from "../../../../../../assets/src/components/settings/Panels/PanelSettings/Fields/TextAreaBox";
import MultiSelectBox from "../../../../../../assets/src/components/settings/Panels/PanelSettings/Fields/MultiSelectBox";
import SectionSpacer from "../../../../../../assets/src/components/settings/Panels/PanelSettings/SectionSpacer";

const WarningMessage =({warningColor}) => <span style={{color:warningColor || "#00000099", fontStyle:"italic", marginLeft: '10px'}}>{warningColor ? "warning" : "note" }: cannot select more than 5 items in this version</span>;

function CreateSalesPop( { onFormSave, upgradeTeaser } ) {
  const { setCreateFromData } = useDispatch( 'sgsb_order_sales_pop' );

  const { createPopupForm, getButtonLoading } = useSelect( ( select ) => ({
    createPopupForm: select( 'sgsb_order_sales_pop' ).getCreateFromData(),
    getButtonLoading: select( 'sgsb_order_sales_pop' ).getButtonLoading()
  }) );

  const onFieldChange = ( key, value ) => {
    setCreateFromData( {
      ...createPopupForm,
      [ key ]: value,
    } );
  };

  const max_option_count_in_free = 5;

  const externalLink = createPopupForm.external_link;
  const externalProductsIds = sales_pop_data.product_list.externalProductsIds;
  const allProductListForSelect = sales_pop_data.product_list.productListForSelect;

  const selectedPopupProducts = createPopupForm.popup_products;
  const isProductsSelectReachedlimit = selectedPopupProducts.length >= max_option_count_in_free;
  let productListForSelect = externalLink ? allProductListForSelect : allProductListForSelect.filter(item => !externalProductsIds.includes(item.value));
  productListForSelect = isProductsSelectReachedlimit ? productListForSelect.filter(item => selectedPopupProducts.includes(item.value)) : productListForSelect;

  const selectedVirtualCountries = createPopupForm.virtual_countries;
  const isCountriesSelectionReachedlimit = selectedVirtualCountries?.length >= max_option_count_in_free;
  let virtualCountriesOptions = createPopupForm.countries;
  virtualCountriesOptions = isCountriesSelectionReachedlimit ? virtualCountriesOptions.filter(item => selectedVirtualCountries.includes(item.value)) : virtualCountriesOptions;

  const virtualName = createPopupForm.virtual_name;
  const virtualNameLength = Array.isArray(virtualName) ? virtualName?.length : (virtualName || "")?.split(",")?.length;
  const isFirstNameReachedLimit = virtualNameLength >= max_option_count_in_free;
  const isFirstNameExceededLimit = virtualNameLength >= max_option_count_in_free + 1;

  const virtualLocationPlaceHolder = `New York City, New York, USA\nBernau, Freistaat Bayern, Germany`;

  const virtualLocationsFormVal = createPopupForm?.virtual_locations;
  const virtualLocationsValue =
    !virtualLocationsFormVal && "" !== virtualLocationsFormVal
      ? virtualLocationPlaceHolder
      : virtualLocationsFormVal;
  
  return (
    <>
      <SettingsSection>
        <Switcher
          name={ 'external_link' }
          changeHandler={ onFieldChange }
          isEnabled={ !!externalLink }
          needUpgrade={ upgradeTeaser }
          isEnable={ Boolean( createPopupForm.enable ) }
          title={ __( 'External Link', 'storegrowth-sales-booster' ) }
          tooltip={ __( 'Working with External/Affiliate Products. Product link is product url', 'storegrowth-sales-booster' ) }
        />
        <Switcher
          name={ 'product_random' }
          changeHandler={ onFieldChange }
          isEnable={ Boolean( createPopupForm.product_random ) }
          title={ __( 'Product Show Random', 'storegrowth-sales-booster' ) }
        />
        <MultiSelectBox
          name={ 'popup_products' }
          changeHandler={ onFieldChange }
          options={ productListForSelect }
          fieldValue={ selectedPopupProducts.map( Number ) }
          title={ __( 'Select Popup Products', 'storegrowth-sales-booster' ) }
          placeHolderText={ __( 'Search for products', 'storegrowth-sales-booster' ) }
        />
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
          placeholder={virtualLocationPlaceHolder }
          title={ __( 'Virtual Location', 'storegrowth-sales-booster' ) }
          placeHolderText={ __( 'New York City, New York, USA\n' +
              'Bernau, Freistaat Bayern, Germany', 'storegrowth-sales-booster' ) }
          tooltip={ __( 'Please write each location on a separate line, following the format: \'city\', \'state\', \'country\'. Use commas to separate the city, state, and country. If you don\'t have a state, leave an empty comma in its place (e.g. city,,country). If you don\'t have a city, leave an empty comma in its place (e.g. ,state,country).', 'storegrowth-sales-booster' ) }
        />
        <SectionSpacer />
      </SettingsSection>

      <Button
        type="primary"
        onClick={ () => !isFirstNameExceededLimit && onFormSave( 'product' ) }
        className='sgsb-settings-save-button'
        loading={ getButtonLoading }
        disabled={isFirstNameExceededLimit}
      >
          { __( 'Save', 'storegrowth-sales-booster' ) }
      </Button>
    </>
  );
}

export default CreateSalesPop;
