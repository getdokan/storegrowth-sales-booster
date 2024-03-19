import { useDispatch, useSelect } from '@wordpress/data';

import { Fragment } from "react";
import { __ } from '@wordpress/i18n';
import { applyFilters } from '@wordpress/hooks';
import { createPopupForm, noop } from '../helper';
import Switcher from "../../../../../../assets/src/components/settings/Panels/PanelSettings/Fields/Switcher";
import SettingsSection from "../../../../../../assets/src/components/settings/Panels/PanelSettings/SettingsSection";
import ActionsHandler from "sales-booster/src/components/settings/Panels/PanelSettings/ActionsHandler";

function General( { onFormSave } ) {
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
  };

  return (
    <Fragment>
      <SettingsSection>
        <Switcher
          colSpan={ 12 }
          name={ 'enable' }
          changeHandler={ onFieldChange }
          title={ __( 'Enable Popup', 'storegrowth-sales-booster' ) }
          isEnable={ (createPopupFormData.enable == 'true' || createPopupFormData.enable == true) ? true : false }
          tooltip={ __( 'By enabling the sales pop will show in the store.', 'storegrowth-sales-booster' ) }
        />
        <Switcher
          colSpan={ 12 }
          name={ 'enble_visibility' }
          changeHandler={ onFieldChange }
          title={ __( 'Stop Popup Visibility On Close', 'storegrowth-sales-booster' ) }
          isEnable={ (createPopupFormData?.enble_visibility == 'true' || createPopupFormData.enble_visibility == true) ? true : false }
          tooltip={ __( 'When enabled if the close button is clicked it the popup will not show until page refresh.' ) }
        />
        {/* Rendered all necessary sales pop settings after popup enable settings. */}
        { applyFilters(
          'sgsb_after_sales_pop_enable_settings',
          '',
          createPopupFormData,
          onFieldChange
        ) }
      </SettingsSection>
      <ActionsHandler
        resetHandler={ onFormReset }
        loadingHandler={ getButtonLoading }
        saveHandler={ () => onFormSave( 'general_settings' ) }
      />
    </Fragment>
  );
}

export default General;
