import { Button } from 'antd';
import { useDispatch, useSelect } from '@wordpress/data';

import { noop } from '../helper';
import { __ } from "@wordpress/i18n";
import Switcher from "../../../../../../assets/src/components/settings/Panels/PanelSettings/Fields/Switcher";
import SettingsSection from "../../../../../../assets/src/components/settings/Panels/PanelSettings/SettingsSection";
import Number from "../../../../../../assets/src/components/settings/Panels/PanelSettings/Fields/Number";

function Time( { onFormSave, upgradeTeaser } ) {
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
  
  /** 
   * This is a numeric validator method that allows positive and numeric values and rejects
   * any other kind of input values.
   * @param {*} key
   * @param {*} value
   */
  const handleNumericInputChange = (key, value) => {
    const numericValue = value.replace(/[^0-9]/g, '');
    onFieldChange(key, numericValue);
  };

  return (
    <>
      <SettingsSection>
        <Switcher
          name={ 'loop' }
          colSpan={ 12 }
          needUpgrade={ upgradeTeaser }
          isEnable={ Boolean( createPopupForm.loop ) }
          changeHandler={ upgradeTeaser ? noop : onFieldChange }
          title={ __( 'Loop', 'storegrowth-sales-booster' ) }
        />
        <Number
          min={ 5 }
          max={ 100 }
          colSpan={ 12 }
          name={ 'next_time_display' }
          needUpgrade={ upgradeTeaser }
          fieldValue={ createPopupForm.next_time_display }
          changeHandler={ upgradeTeaser ? noop : handleNumericInputChange }
          title={ __( 'Next Time Display', 'storegrowth-sales-booster' ) }
          placeHolderText={ __( 'Enter Next Time Display', 'storegrowth-sales-booster' ) }
          tooltip={ __( 'Time to start next notification(in seconds)', 'storegrowth-sales-booster' ) }
        />
        <Number
          min={ 5 }
          max={ 100 }
          colSpan={ 12 }
          needUpgrade={ upgradeTeaser }
          name={ 'notification_per_page' }
          fieldValue={ createPopupForm.notification_per_page }
          changeHandler={ upgradeTeaser ? noop : handleNumericInputChange }
          title={ __( 'Notification Per Page', 'storegrowth-sales-booster' ) }
          placeHolderText={ __( 'Enter Notification Per Page', 'storegrowth-sales-booster' ) }
          tooltip={ __( 'Quantity Notifications Per Page', 'storegrowth-sales-booster' ) }
        />
        <Number
          min={ 5 }
          max={ 100 }
          colSpan={ 12 }
          name={ 'initial_time_delay' }
          needUpgrade={ upgradeTeaser }
          fieldValue={ createPopupForm.initial_time_delay }
          changeHandler={ upgradeTeaser ? noop : handleNumericInputChange }
          title={ __( 'Initial Time Delay', 'storegrowth-sales-booster' ) }
          placeHolderText={ __( 'Enter Initial Time Delay', 'storegrowth-sales-booster' ) }
          tooltip={ __( 'When Your Site Load, Notification will wait this time to show(in seconds)', 'storegrowth-sales-booster' ) }
        />
        <Number
          min={ 5 }
          max={ 100 }
          colSpan={ 12 }
          name={ 'dispaly_time' }
          needUpgrade={ upgradeTeaser }
          fieldValue={ createPopupForm.dispaly_time }
          changeHandler={ upgradeTeaser ? noop : handleNumericInputChange }
          title={ __( 'Display Time', 'storegrowth-sales-booster' ) }
          placeHolderText={ __( 'Enter Virtual Time', 'storegrowth-sales-booster' ) }
          tooltip={ __( 'Time your notification display', 'storegrowth-sales-booster' ) }
        />
      </SettingsSection>

      <Button
        disabled={upgradeTeaser}
        type="primary"
        onClick={ upgradeTeaser ? noop : () => onFormSave( 'general_settings' ) }
        className='order-bump-save-change-button'
        loading={ getButtonLoading }
      >
        Save Changes
      </Button>
    </>
  );
}

export default Time;
