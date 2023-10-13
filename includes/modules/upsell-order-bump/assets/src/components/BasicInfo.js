import { __ } from "@wordpress/i18n";
import { Row, Col, Typography, Select, Card, InputNumber } from 'antd';
import { useDispatch, useSelect } from '@wordpress/data';
import TextInput from "sales-booster/src/components/settings/Panels/PanelSettings/Fields/TextInput";
import SettingsSection from "sales-booster/src/components/settings/Panels/PanelSettings/SettingsSection";
import MultiSelectBox from "sales-booster/src/components/settings/Panels/PanelSettings/Fields/MultiSelectBox";
import SectionHeader from "sales-booster/src/components/settings/Panels/SectionHeader";
import FieldWrapper from "sales-booster/src/components/settings/Panels/PanelSettings/Fields/FieldWrapper";
import SettingsTooltip from "sales-booster/src/components/settings/Panels/PanelSettings/SettingsTooltip";
import UpgradeCrown from "sales-booster/src/components/settings/Panels/PanelSettings/UpgradeCrown";
import {noop} from "sales-booster-sales-pop/src/helper";
import SelectBox from "sales-booster/src/components/settings/Panels/PanelSettings/Fields/SelectBox";
import { Fragment } from "react";

const { Title } = Typography;

const BasicInfo = ( { clearErrors } ) => {
  const { setCreateFromData } = useDispatch( 'sgsb_order_bump' );
  const { createBumpData } = useSelect( select => ( {
    createBumpData: select( 'sgsb_order_bump' ).getCreateFromData()
  } ) );

  const onFieldChange = ( key, value ) => {
    clearErrors();
    if ( key === 'offer_product' ) {
      setCreateFromData( {
        ...createBumpData,
        [ key ]                     : value,
        offer_image_url             : products_and_categories.product_list_for_view[value].image_url,
        offer_product_title         : products_and_categories.product_list_for_view[value].post_title,
        offer_product_regular_price : products_and_categories.product_list_for_view[value].regular_price
      } );
    } else {
      setCreateFromData({
        ...createBumpData,
        [ key ]: value
      });
    }
  };

  const offerProductId = createBumpData?.offer_product;
  const originalProductListForSelect = products_and_categories.product_list.productListForSelect;
  const productListForSelect = offerProductId ? originalProductListForSelect.filter(item => item.value !== offerProductId) : originalProductListForSelect;

  const targetProducts = createBumpData.target_products;
  const originalSimpleProductForOffer = products_and_categories.product_list.simpleProductForOffer;
  const simpleProductForOffer = Array.isArray(targetProducts) && targetProducts.length !== 0 ?
    originalSimpleProductForOffer.filter(item => !targetProducts.includes(item.value) ) : originalSimpleProductForOffer;

  const bumpSchedules = [
    { value: 'daily', label: __( 'Daily', 'storegrowth-sales-booster' ) },
    { value: 'saturday', label: __( 'Saturday', 'storegrowth-sales-booster' ) },
    { value: 'sunday', label: __( 'Sunday', 'storegrowth-sales-booster' ) },
    { value: 'monday', label: __( 'Monday', 'storegrowth-sales-booster' ) },
    { value: 'tuesday', label: __( 'Tuesday', 'storegrowth-sales-booster' ) },
    { value: 'wednesday', label: __( 'Wednesday', 'storegrowth-sales-booster' ) },
    { value: 'thursday', label: __( 'Thursday', 'storegrowth-sales-booster' ) },
    { value: 'friday', label: __( 'Friday', 'storegrowth-sales-booster' ) },
  ];

  const offerOptions = [
    { value: 'discount', label: __( 'Discount%', 'storegrowth-sales-booster' ) },
    { value: 'price', label: __( 'Price', 'storegrowth-sales-booster' ) },
  ];

  return (
    <Fragment>
      <SettingsSection>
        <TextInput
          fullWidth={ true }
          name={ `name_of_order_bump` }
          changeHandler={ onFieldChange }
          fieldValue={ createBumpData.name_of_order_bump }
          title={ __( 'Name of Order Bump', 'storegrowth-sales-booster' ) }
          placeHolderText={ __( 'Enter Order Bump Name', 'storegrowth-sales-booster' ) }
        />
        <MultiSelectBox
          name={ 'target_products' }
          changeHandler={ onFieldChange }
          options={ productListForSelect }
          fieldValue={ createBumpData.target_products.map( Number ) }
          title={ __( 'Select Target Product(s)', 'storegrowth-sales-booster' ) }
          placeHolderText={ __( 'Search for products', 'storegrowth-sales-booster' ) }
        />
        <MultiSelectBox
          name={ 'target_categories' }
          changeHandler={ onFieldChange }
          fieldValue={ createBumpData.target_categories.map( Number ) }
          options={ products_and_categories.category_list.catForSelect }
          title={ __( 'Select Target Categories', 'storegrowth-sales-booster' ) }
          placeHolderText={ __( 'Search for Categories', 'storegrowth-sales-booster' ) }
        />
        <MultiSelectBox
          name={ 'bump_schedule' }
          options={ bumpSchedules }
          changeHandler={ onFieldChange }
          fieldValue={ createBumpData.bump_schedule }
          title={ __( 'Order Bump Schedule', 'storegrowth-sales-booster' ) }
          placeHolderText={ __( 'Please select bump schedule', 'storegrowth-sales-booster' ) }
        />
      </SettingsSection>
      <SectionHeader title={ __( 'Offer Section', 'storegrowth-sales-booster' ) } />
      <SettingsSection>
        <SelectBox
          colSpan={ 24 }
          showSearch={ true }
          fieldWidth={ '100%' }
          name={ `offer_product` }
          changeHandler={ onFieldChange }
          options={ simpleProductForOffer }
          classes={ `search-single-select` }
          title={ __( 'Offer Product Title', 'storegrowth-sales-booster' ) }
          placeHolderText={ __( 'Search for offer product', 'storegrowth-sales-booster' ) }
          fieldValue={ parseInt( createBumpData.offer_product ) ? parseInt( createBumpData.offer_product ) : null }
          filterOption={ ( inputValue, option ) => option.label
            ?.toString()
            ?.toLowerCase()
            ?.includes( inputValue.toLowerCase() )
          }
        />
        <Col className="gutter-row" span={ 24 }>
          <Card className={ `sgsb-settings-card` }>
            <Row>
              <Col span={ 9 }>
                <div className={ `card-heading` }>
                  <Title level={ 3 } className={ `settings-heading` }>
                    { __( 'Offer Price/Discount', 'storegrowth-sales-booster' ) }
                  </Title>
                </div>
              </Col>
              <Col span={15}>
                <Row gutter={10} style={{ margin: 0 }}>
                  <Col span={6} style={{ paddingLeft: 0 }}>
                    <Select
                      style={{ width: '100%' }}
                      options={ offerOptions }
                      value={ createBumpData.offer_type }
                      onChange={ ( v ) => onFieldChange( 'offer_type', v ) }
                      className={ `settings-field single-select-field combine-select` }
                    />
                  </Col>
                  <Col span={18} style={{ paddingRight: 0 }}>
                    <InputNumber
                      value={ createBumpData.offer_amount }
                      className={ `settings-field number-field combine-field` }
                      onChange={ ( value ) => onFieldChange( 'offer_amount', value ) }
                    />
                  </Col>
                </Row>
              </Col>
            </Row>
          </Card>
        </Col>
      </SettingsSection>
    </Fragment>
  );
};

export default BasicInfo;
