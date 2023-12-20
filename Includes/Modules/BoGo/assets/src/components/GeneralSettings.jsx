import { Fragment } from 'react';
import { __ } from "@wordpress/i18n";
import SettingsSection from 'sales-booster/src/components/settings/Panels/PanelSettings/SettingsSection';
import Switcher from 'sales-booster/src/components/settings/Panels/PanelSettings/Fields/Switcher';


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
