import { Form, Select, Switch, Input, Button } from 'antd';

const { TextArea } = Input;
import { useDispatch, useSelect } from '@wordpress/data';

const WarningMessage =({warningColor}) => <span style={{color:warningColor || "#00000099", fontStyle:"italic"}}>{warningColor ? "warning" : "note" }: cannot select more than 5 items in this version</span>;

function CreateSalesPop( { onFormSave } ) {
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
  const virtualNameLength = Array.isArray(virtualName) ? virtualName?.length : (virtualName || "").split(",")?.length;
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

      {/* <Form.Item
        extra="Working with External/Affiliate Products. Product link is product url"
        label="External Link"
        labelAlign='left'
      >
        <Switch
          checked={ !!externalLink }
          onChange={ ( v ) => onFieldChange( 'external_link', v ) }
        />
      </Form.Item> */}

      <Form.Item
        label="Product Show Random"
        labelAlign='left'
      >
        <Switch
          checked={ (createPopupForm.product_random == 'true' || createPopupForm.product_random == true) ? true : false }
          onChange={ ( v ) => onFieldChange( 'product_random', v ) }
        />
      </Form.Item>

      <Form.Item
        label="Select Popup Products"
        labelAlign='left'
      >
        {isProductsSelectReachedlimit && <WarningMessage /> }
        <Select
          allowClear
          placeholder="Search for products"
          options={ productListForSelect }
          onChange={ ( v ) => onFieldChange( 'popup_products', v ) }
          mode="multiple"
          filterOption={ true }
          optionFilterProp="label"
          value={ selectedPopupProducts.map( Number ) }
        />

      </Form.Item>

      <Form.Item
        label="Virtual First Name"
        labelAlign='left'
        extra="Please use comma(,) separator to insert multiple name"
      >
        {(isFirstNameReachedLimit || isFirstNameExceededLimit) && <WarningMessage warningColor={isFirstNameExceededLimit ? "#f00" : false} />}
        <TextArea
          rows={ 4 }
          value={ virtualName }
          onChange={ ( v ) => {
            onFieldChange( 'virtual_name', v.target.value ) 
        }}
          placeholder='Name1, Name2, Name3'
        />
      </Form.Item>

      <Form.Item
        label="Virtual Location"
        labelAlign='left'
        extra="Please write each location on a separate line, following the format: 'city', 'state', 'country'. Use commas to separate the city, state, and country. If you don't have a state, leave an empty comma in its place (e.g. city,,country). If you don't have a city, leave an empty comma in its place (e.g. ,state,country)."
        rules={ [
          { message: 'Please Write your virtual locations' },
        ] }
      >
        <TextArea
          rows={ 4 }
          value={virtualLocationsValue}
          onChange={ ( e ) => onFieldChange( 'virtual_locations', e.target.value ) }
          placeholder={virtualLocationPlaceHolder}
        />
      </Form.Item>

      <Button
        type="primary"
        onClick={ () => !isFirstNameExceededLimit && onFormSave( 'product' ) }
        className='order-bump-save-change-button'
        loading={ getButtonLoading }
        disabled={isFirstNameExceededLimit}
      >
        Save Changes
      </Button>
    </>
  );
}

export default CreateSalesPop;
