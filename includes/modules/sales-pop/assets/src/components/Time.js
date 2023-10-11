import { useDispatch, useSelect } from '@wordpress/data';

import { __ } from "@wordpress/i18n";
import { createPopupForm, noop } from '../helper';
import Switcher from "../../../../../../assets/src/components/settings/Panels/PanelSettings/Fields/Switcher";
import SettingsSection from "../../../../../../assets/src/components/settings/Panels/PanelSettings/SettingsSection";
import Number from "../../../../../../assets/src/components/settings/Panels/PanelSettings/Fields/Number";
import ActionsHandler from "sales-booster/src/components/settings/Panels/PanelSettings/ActionsHandler";
import { Fragment } from "react";

function Time( { onFormSave, upgradeTeaser } ) {
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
  
  /** 
   * This is a numeric validator method that allows positive and numeric values and rejects
   * any other kind of input values.
   * @param {*} key
   * @param {*} value
   */
  const handleNumericInputChange = (key, value) => {
    const numericValue = String( value )?.replace(/[^0-9]/g, '');
    onFieldChange(key, numericValue);
  };

  return (
    <Fragment>
      <SettingsSection>
        <Switcher
          name={ 'loop' }
          colSpan={ 12 }
          needUpgrade={ upgradeTeaser }
          isEnable={ Boolean( createPopupFormData.loop ) }
          changeHandler={ upgradeTeaser ? noop : onFieldChange }
          title={ __( 'Loop', 'storegrowth-sales-booster' ) }
        />
        <Number
          min={ 1 }
          colSpan={ 12 }
          name={ 'next_time_display' }
          needUpgrade={ upgradeTeaser }
          fieldValue={ createPopupFormData.next_time_display }
          changeHandler={ upgradeTeaser ? noop : handleNumericInputChange }
          title={ __( 'Next Time Display', 'storegrowth-sales-booster' ) }
          placeHolderText={ __( 'Enter Next Time Display', 'storegrowth-sales-booster' ) }
          tooltip={ __( 'Time to start next notification(in seconds)', 'storegrowth-sales-booster' ) }
        />
        <Number
          min={ 1 }
          colSpan={ 12 }
          needUpgrade={ upgradeTeaser }
          name={ 'notification_per_page' }
          fieldValue={ createPopupFormData.notification_per_page }
          changeHandler={ upgradeTeaser ? noop : handleNumericInputChange }
          title={ __( 'Notification Per Page', 'storegrowth-sales-booster' ) }
          placeHolderText={ __( 'Enter Notification Per Page', 'storegrowth-sales-booster' ) }
          tooltip={ __( 'Quantity Notifications Per Page', 'storegrowth-sales-booster' ) }
        />
        <Number
          min={ 1 }
          colSpan={ 12 }
          name={ 'initial_time_delay' }
          needUpgrade={ upgradeTeaser }
          fieldValue={ createPopupFormData.initial_time_delay }
          changeHandler={ upgradeTeaser ? noop : handleNumericInputChange }
          title={ __( 'Initial Time Delay', 'storegrowth-sales-booster' ) }
          placeHolderText={ __( 'Enter Initial Time Delay', 'storegrowth-sales-booster' ) }
          tooltip={ __( 'When Your Site Load, Notification will wait this time to show(in seconds)', 'storegrowth-sales-booster' ) }
        />
        <Number
          min={ 1 }
          colSpan={ 12 }
          name={ 'dispaly_time' }
          needUpgrade={ upgradeTeaser }
          fieldValue={ createPopupFormData.dispaly_time }
          changeHandler={ upgradeTeaser ? noop : handleNumericInputChange }
          title={ __( 'Display Time', 'storegrowth-sales-booster' ) }
          placeHolderText={ __( 'Enter Virtual Time', 'storegrowth-sales-booster' ) }
          tooltip={ __( 'Time your notification display', 'storegrowth-sales-booster' ) }
        />
      </SettingsSection>

      <ActionsHandler
        isDisabled={ upgradeTeaser }
        resetHandler={ onFormReset }
        loadingHandler={ getButtonLoading }
        saveHandler={ upgradeTeaser ? noop : () => onFormSave( 'general_settings' ) }
      />
    </Fragment>
  );
}

export default Time;
