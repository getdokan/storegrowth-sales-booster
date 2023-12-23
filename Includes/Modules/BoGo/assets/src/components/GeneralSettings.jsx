import { Fragment } from 'react';
import { __ } from "@wordpress/i18n";
import SettingsSection from 'sales-booster/src/components/settings/Panels/PanelSettings/SettingsSection';
import { SectionSpacer, Switcher, TextAreaBox } from 'sales-booster/src/components/settings/Panels';


const GeneralSettings = () => {
  // const { setCreateFromData } = useDispatch( 'sgsb_order_sales_pop' );

  // const { createPopupFormData, getButtonLoading } = useSelect( ( select ) => ({
  //   createPopupFormData : select( 'sgsb_order_sales_pop' ).getCreateFromData(),
  //   getButtonLoading    : select( 'sgsb_order_sales_pop' ).getButtonLoading()
  // }) );

  // const onFieldChange = ( key, value ) => {
  //   setCreateFromData( {
  //     ...createPopupFormData,
  //     [ key ]: value,
  //   } );
  // };

  // const onFormReset = () => {
  //   setCreateFromData( { ...createPopupForm } );
  // };

  return (
    <Fragment>
      <SettingsSection>
        <Switcher
          colSpan={12}
          name={'offer_remove_cart'}
          // changeHandler={ onFieldChange }
          title={__('Allow Remove Offer Product', 'storegrowth-sales-booster')}
          isEnable={true}
          tooltip={__('Allow the customer to remove the offer product from the cart.')}
        />
        <Switcher
          colSpan={12}
          name={'regular_price_show'}
          // changeHandler={ onFieldChange }
          title={__('Show Regular Price', 'storegrowth-sales-booster')}
          isEnable={true}
          tooltip={__('It will show the offer price along with the regular price.')}
        />
        <Switcher
          colSpan={12}
          name={'shop_page_bage_icon'}
          // changeHandler={ onFieldChange }
          title={__('Shop Page Badge Icon', 'storegrowth-sales-booster')}
          isEnable={true}
          tooltip={__('The badge icon will show in the shop page.')}
        />
        <Switcher
          colSpan={12}
          name={'global_product_page_bage_icon'}
          // changeHandler={ onFieldChange }
          title={__('Product Page Badge Icon', 'storegrowth-sales-booster')}
          isEnable={true}
          tooltip={__('The badge icon will show in the product page.')}
        />
        <Switcher
          colSpan={12}
          name={'bogo_category_page_message_enable'}
          // changeHandler={ onFieldChange }
          title={__('Enable Category Page Message', 'storegrowth-sales-booster')}
          isEnable={true}
          tooltip={__('The badge icon will show in the product page.')}
        />
        {true &&
          (
            <Fragment>
              <SectionSpacer />
              <TextAreaBox
                areaRows={3}
                name={'bogo_category_page_message'}
                // fieldValue={createBogoData?.bogo_product_page_message}
                // upgradeOverlay={false}
                // needUpgrade={isFirstNameExceededLimit}
                // inputRestrictor={isFirstNameExceededLimit}
                // changeHandler={onFieldChange}
                title={__('Category Page Message', 'storegrowth-sales-booster')}
                placeHolderText={__('Enter the text for shop page', 'storegrowth-sales-booster')}
                tooltip={__('example text', 'storegrowth-sales-booster')}
              />
            </Fragment>)
        }

      </SettingsSection>
      {/* <ActionsHandler
      resetHandler={ onFormReset }
      loadingHandler={ getButtonLoading }
      saveHandler={ () => onFormSave( 'general_settings' ) }
    /> */}
    </Fragment>
  )
}

export default GeneralSettings
