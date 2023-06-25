import { Button } from 'antd';
import { useDispatch, useSelect } from '@wordpress/data';
import TextDesign from './TextDesign';
import BasicDesign from './BasicDesign';

function Desgin( { onFormSave } ) {
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

  return (
    <>
      <BasicDesign
        createPopupForm={ createPopupForm }
        onFieldChange={ onFieldChange }
      />

      {/* normal text */ }
      {/* <TextDesign
        createPopupForm={ createPopupForm }
        onFieldChange={ onFieldChange }
        textTitle='Normal Text'
        fontName='normal_text_color'
        fontColor={ createPopupForm.normal_text_color }
        fontSizeName='normal_text_font_size'
        fontSize={ createPopupForm.normal_text_font_size }
        fontWeightName='normal_text_font_weight'
        fontWeight={ createPopupForm.normal_text_font_weight }
      /> */}

      {/* product name text*/ }
      <TextDesign
        createPopupForm={ createPopupForm }
        onFieldChange={ onFieldChange }
        textTitle='Product Name Text'
        fontName='product_title_color'
        fontColor={ createPopupForm.product_title_color }
        fontSizeName='product_title_font_size'
        fontSize={ createPopupForm.product_title_font_size }
        fontWeightName='product_title_font_weight'
        fontWeight={ createPopupForm.product_title_font_weight }
      />

      {/* product link text*/ }
      {/* <TextDesign
        createPopupForm={ createPopupForm }
        onFieldChange={ onFieldChange }
        textTitle='Product Link Text'
        fontName='product_link_color'
        fontColor={ createPopupForm.product_link_color }
        fontSizeName='product_link_font_size'
        fontSize={ createPopupForm.product_link_font_size }
        fontWeightName='product_link_font_weight'
        fontWeight={ createPopupForm.product_link_font_weight }
      /> */}

      {/* time text*/ }
      <TextDesign
        createPopupForm={ createPopupForm }
        onFieldChange={ onFieldChange }
        textTitle='Time Text'
        fontName='time_text_color'
        fontColor={ createPopupForm.time_text_color }
        fontSizeName='time_text_font_size'
        fontSize={ createPopupForm.time_text_font_size }
        fontWeightName='time_text_font_weight'
        fontWeight={ createPopupForm.time_text_font_weight }
      />

      {/* date text*/ }
      {/* <TextDesign
        createPopupForm={ createPopupForm }
        onFieldChange={ onFieldChange }
        textTitle='Date Text'
        fontName='date_text_color'
        fontColor={ createPopupForm.date_text_color }
        fontSizeName='date_text_font_size'
        fontSize={ createPopupForm.date_text_font_size }
        fontWeightName='date_text_font_weight'
        fontWeight={ createPopupForm.date_text_font_weight }
      /> */}

      {/* country text*/ }
      <TextDesign
        createPopupForm={ createPopupForm }
        onFieldChange={ onFieldChange }
        textTitle='Country Text'
        fontName='country_text_color'
        fontColor={ createPopupForm.country_text_color }
        fontSizeName='country_text_font_size'
        fontSize={ createPopupForm.country_text_font_size }
        fontWeightName='country_text_font_weight'
        fontWeight={ createPopupForm.country_text_font_weight }
      />

      {/* state text */ }
      {/* <TextDesign
        createPopupForm={ createPopupForm }
        onFieldChange={ onFieldChange }
        textTitle='State Text'
        fontName='state_text_color'
        fontColor={ createPopupForm.state_text_color }
        fontSizeName='state_text_font_size'
        fontSize={ createPopupForm.state_text_font_size }
        fontWeightName='state_text_font_weight'
        fontWeight={ createPopupForm.state_text_font_weight }
      /> */}

      {/* city text */ }
      {/* <TextDesign
        createPopupForm={ createPopupForm }
        onFieldChange={ onFieldChange }
        textTitle='City Text'
        fontName='city_text_color'
        fontColor={ createPopupForm.city_text_color }
        fontSizeName='city_text_font_size'
        fontSize={ createPopupForm.city_text_font_size }
        fontWeightName='city_text_font_weight'
        fontWeight={ createPopupForm.city_text_font_weight }
      /> */}

      {/* name text */ }
      <TextDesign
        createPopupForm={ createPopupForm }
        onFieldChange={ onFieldChange }
        textTitle='Name Text'
        fontName='name_text_color'
        fontColor={ createPopupForm.name_text_color }
        fontSizeName='name_text_font_size'
        fontSize={ createPopupForm.name_text_font_size }
        fontWeightName='name_text_font_weight'
        fontWeight={ createPopupForm.name_text_font_weight }
      />

      <Button
        type="primary"
        onClick={ () => onFormSave( 'design' ) }
        className='order-bump-save-change-button'
        loading={ getButtonLoading }
      >
        Save Changes
      </Button>
    </>
  );
}

export default Desgin;
