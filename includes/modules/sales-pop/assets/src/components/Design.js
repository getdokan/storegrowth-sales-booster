import { useDispatch, useSelect } from '@wordpress/data';
import TextDesign from './TextDesign';
import BasicDesign from './BasicDesign';
import { Fragment } from "react";
import ActionsHandler from "sales-booster/src/components/settings/Panels/PanelSettings/ActionsHandler";
import { createPopupForm } from "../helper";
import {__} from "@wordpress/i18n";

function Design( { onFormSave, upgradeTeaser } ) {
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

  return (
    <Fragment>
      <BasicDesign
        createPopupForm={ createPopupFormData }
        onFieldChange={ onFieldChange }
        upgradeTeaser={upgradeTeaser}
      />

      { Boolean( createPopupFormData?.text_style ) && (
        <Fragment>
          {/* normal text */ }
          <TextDesign
            upgradeTeaser={upgradeTeaser}
            createPopupForm={ createPopupFormData }
            onFieldChange={ onFieldChange }
            textTitle='Normal Text'
            fontName='normal_text_color'
            fontColor={ createPopupFormData.normal_text_color }
            fontSizeName='normal_text_font_size'
            fontSize={ createPopupFormData.normal_text_font_size }
            fontWeightName='normal_text_font_weight'
            fontWeight={ createPopupFormData.normal_text_font_weight }
            tooltip={ __( 'Modify  the text style of the normal text in the sales pop.', 'storegrowth-sales-booster' ) }
          />

          {/* product name text*/ }
          <TextDesign
            createPopupForm={ createPopupFormData }
            onFieldChange={ onFieldChange }
            textTitle='Product Name Text'
            fontName='product_title_color'
            fontColor={ createPopupFormData.product_title_color }
            fontSizeName='product_title_font_size'
            fontSize={ createPopupFormData.product_title_font_size }
            fontWeightName='product_title_font_weight'
            fontWeight={ createPopupFormData.product_title_font_weight }
            tooltip={ __( 'Modify the text style in the product name sales pop.', 'storegrowth-sales-booster' ) }
          />

          {/* time text*/ }
          <TextDesign
            createPopupForm={ createPopupFormData }
            onFieldChange={ onFieldChange }
            textTitle='Time Text'
            fontName='time_text_color'
            fontColor={ createPopupFormData.time_text_color }
            fontSizeName='time_text_font_size'
            fontSize={ createPopupFormData.time_text_font_size }
            fontWeightName='time_text_font_weight'
            fontWeight={ createPopupFormData.time_text_font_weight }
            tooltip={ __( 'Modify the text style of the time in the sales pop.', 'storegrowth-sales-booster' ) }
          />

          {/* country text*/ }
          <TextDesign
            createPopupForm={ createPopupFormData }
            onFieldChange={ onFieldChange }
            textTitle='Country Text'
            fontName='country_text_color'
            fontColor={ createPopupFormData.country_text_color }
            fontSizeName='country_text_font_size'
            fontSize={ createPopupFormData.country_text_font_size }
            fontWeightName='country_text_font_weight'
            fontWeight={ createPopupFormData.country_text_font_weight }
            tooltip={ __( 'Modify the text style of the country name in the sales pop.', 'storegrowth-sales-booster' ) }
          />

          {/* state text */ }
          <TextDesign
            upgradeTeaser={upgradeTeaser}
            createPopupForm={ createPopupFormData }
            onFieldChange={ onFieldChange }
            textTitle='State Text'
            fontName='state_text_color'
            fontColor={ createPopupFormData.state_text_color }
            fontSizeName='state_text_font_size'
            fontSize={ createPopupFormData.state_text_font_size }
            fontWeightName='state_text_font_weight'
            fontWeight={ createPopupFormData.state_text_font_weight }
            tooltip={ __( 'Modify the text style of the state name in the sales pop.', 'storegrowth-sales-booster' ) }
          />

          {/* city text */ }
          <TextDesign
            upgradeTeaser={ upgradeTeaser }
            createPopupForm={ createPopupFormData }
            onFieldChange={ onFieldChange }
            textTitle='City Text'
            fontName='city_text_color'
            fontColor={ createPopupFormData.city_text_color }
            fontSizeName='city_text_font_size'
            fontSize={ createPopupFormData.city_text_font_size }
            fontWeightName='city_text_font_weight'
            fontWeight={ createPopupFormData.city_text_font_weight }
            tooltip={ __( 'Modify the text style of the city name in the sales pop.', 'storegrowth-sales-booster' ) }
          />

          {/* name text */ }
          {/* <TextDesign
            createPopupForm={ createPopupFormData }
            onFieldChange={ onFieldChange }
            textTitle='Shop Name Text'
            fontName='name_text_color'
            fontColor={ createPopupFormData.name_text_color }
            fontSizeName='name_text_font_size'
            fontSize={ createPopupFormData.name_text_font_size }
            fontWeightName='name_text_font_weight'
            fontWeight={ createPopupFormData.name_text_font_weight }
          /> */}
        </Fragment>
      ) }

      <ActionsHandler
        resetHandler={ onFormReset }
        loadingHandler={ getButtonLoading }
        saveHandler={ () => onFormSave( 'general_settings' ) }
      />
    </Fragment>
  );
}

export default Design;
