import { Form, Select, Switch, Input, Button } from 'antd';

const { TextArea } = Input;
import { useDispatch, useSelect } from '@wordpress/data';
import { State, City } from 'country-state-city';

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

  const onFieldChangeCountry = ( key, value ) => {
    var stateByCountry = []
    var i = 0;

    value.map( ( coutryIsoCode, j ) => {
      const states = State.getStatesOfCountry( coutryIsoCode );
      for ( var stateInfo in states ) {
        stateByCountry[ i ] = states[ stateInfo ];
        i++;

      }
    } )

    const stateByCountryFinal = stateByCountry.map( ( stateInfo ) => ({
      label: stateInfo.name,
      value: stateInfo.countryCode + '#' + stateInfo.isoCode
    }) );

    var fCountry = value;

    var final_virtual_state = createPopupForm.virtual_state.filter( ( item, i ) => {
      const countryState = item.split( "#" );
      return fCountry.includes( countryState[ 0 ] )
    } )

    var final_virtual_city = createPopupForm.virtual_city.filter( ( item, i ) => {
      const countryStateCity = item.split( "#" );
      var countryStateCode = countryStateCity[ 0 ] + "#" + countryStateCity[ 1 ];

      return final_virtual_state.includes( countryStateCode )

    } )

    setCreateFromData( {
      ...createPopupForm,
      [ key ]: value,
      state_by_country: stateByCountryFinal,
      virtual_state: final_virtual_state,
      virtual_city: final_virtual_city
    } );
  };

  const onFieldChangeState = ( key, value ) => {
    setCreateFromData( {
      ...createPopupForm,
      [ key ]: value,
    } );


    var cityByState = []
    var i = 0;

    value.map( ( countryCodeAndStateCode, k ) => {
      let hasPosition = countryCodeAndStateCode.indexOf( "#" )
      let stateCode = countryCodeAndStateCode.substring( hasPosition + 1 );
      let countryCode = countryCodeAndStateCode.substring( 0, hasPosition );
      const cities = City.getCitiesOfState( countryCode, stateCode );
      for ( var city in cities ) {
        cityByState[ i ] = cities[ city ];
        i++;

      }
    } )


    const cityByStateFinal = cityByState.map( ( cityInfo ) => ({
      label: cityInfo.name,
      value: cityInfo.countryCode + "#" + cityInfo.stateCode + '#' + cityInfo.name
    }) );

    var fState = value;
    var final_virtual_city = createPopupForm.virtual_city.filter( ( item, i ) => {
      const countryStateCity = item.split( "#" );
      var countryStateCode = countryStateCity[ 0 ] + "#" + countryStateCity[ 1 ];

      return fState.includes( countryStateCode )

    } )


    setCreateFromData( {
      ...createPopupForm,
      [ key ]: value,
      city_by_state: cityByStateFinal,
      virtual_city: final_virtual_city
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

  const warningMessage = <span style={{color:"red", fontStyle:"italic"}}>cannot select more than 5 items in this version</span>;

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
        {isProductsSelectReachedlimit && warningMessage }
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
        <TextArea
          rows={ 4 }
          value={ createPopupForm.virtual_name }
          onChange={ ( v ) => onFieldChange( 'virtual_name', v.target.value ) }
          placeholder='Name1, Name2, Name3'
        />
      </Form.Item>

      {/* <Form.Item

        label="Virtual Address Type"
        labelAlign='left'
        extra="You can use auto detect address or make virtual address for customer"
        rules={ [
          {
            message: 'Please select offer type',
          },
        ] }
      >
        <Select
          onChange={ ( v ) => onFieldChange( 'address', v ) }
          value={ createPopupForm.address }

        >
          <Select.Option value="real">Real Address</Select.Option>
          <Select.Option value="virtual">Virtual Address</Select.Option>

        </Select>
      </Form.Item> */}


      <Form.Item

        label="Virtual Country"
        labelAlign='left'
        extra="Virtual country show on notification"
      >
        {isCountriesSelectionReachedlimit && <span style={{color:"red", fontStyle:"italic"}}>cannot select more than 5 items in this version</span> }
        <Select
          allowClear
          placeholder="Search for products"
          options={ virtualCountriesOptions }
          onChange={ ( v ) => onFieldChangeCountry( 'virtual_countries', v ) }
          mode="multiple"
          filterOption={ true }
          optionFilterProp="label"
          value={ selectedVirtualCountries }

        />
      </Form.Item>

      {/* <Form.Item
        label="Virtual State"
        labelAlign='left'
        extra="Virtual state what will show on notification"
      >
        <Select
          allowClear
          placeholder="Search for virtual city"
          options={ createPopupForm.state_by_country }
          onChange={ ( v ) => onFieldChangeState( 'virtual_state', v ) }
          mode="multiple"
          filterOption={ true }
          optionFilterProp="label"
          value={ createPopupForm.virtual_state }

        />
      </Form.Item>
      { createPopupForm.city_by_state.length ?
        <Form.Item
          label="Virtual City"
          labelAlign='left'
          extra="Virtual city what will show on notification"
        >
          <Select
            allowClear
            placeholder="Search for virtual city"
            options={ createPopupForm.city_by_state }
            onChange={ ( v ) => onFieldChange( 'virtual_city', v ) }
            mode="multiple"
            filterOption={ true }
            optionFilterProp="label"
            value={ createPopupForm.virtual_city }

          />
        </Form.Item> : null } */}
      <Button
        type="primary"
        onClick={ () => onFormSave( 'product' ) }
        className='order-bump-save-change-button'
        loading={ getButtonLoading }
      >
        Save Changes
      </Button>
    </>
  );
}

export default CreateSalesPop;
