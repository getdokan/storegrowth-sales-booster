import { Button } from 'antd';
import { useDispatch, useSelect } from '@wordpress/data';

import { noop } from '../helper';
import { __ } from "@wordpress/i18n";
import {addFilter} from "@wordpress/hooks";
import TextAreaBox from "../../../../../../assets/src/components/settings/Panels/PanelSettings/Fields/TextAreaBox";
import SettingsSection from "../../../../../../assets/src/components/settings/Panels/PanelSettings/SettingsSection";

function Message( { onFormSave, upgradeTeaser } ) {
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
   * Add textarea settings content after textarea field.
   *
   * @since 1.0.0
   *
   * @return string
   */
  addFilter(
    'sgsb_after_textarea_settings',
    'sgsb_after_textarea_settings_callback',
    () => {
      return (
        <div className={ `textarea-content` }>
          <p>{ '{product_title} = ' + __( 'Title of Product', 'storegrowth-sales-booster' ) }</p>
          <p>{ '{virtual_name} = ' + __( 'Name of purchaser', 'storegrowth-sales-booster' ) }</p>
          <p>{ '{location} = ' + __( 'Where from bought the product', 'storegrowth-sales-booster' ) }</p>
          <p>{ '{time} = ' + __( 'When Product Purchased', 'storegrowth-sales-booster' ) }</p>
        </div>
      );
    }
  );

  return (
    <>
      <SettingsSection>
        <TextAreaBox
          areaRows={ 4 }
          name={ 'message_popup' }
          needUpgrade={ upgradeTeaser }
          fieldValue={ createPopupForm.message_popup }
          changeHandler={ upgradeTeaser ? noop : onFieldChange }
          title={ __( 'Message Popup', 'storegrowth-sales-booster' ) }
          placeHolderText={ __( 'Enter Message Popup', 'storegrowth-sales-booster' ) }
        />
      </SettingsSection>

      <Button
        type="primary"
        onClick={ () => onFormSave( 'message' ) }
        className='order-bump-save-change-button'
        loading={ getButtonLoading }
      >
        Save Changes
      </Button>
    </>
  );
}

export default Message;
