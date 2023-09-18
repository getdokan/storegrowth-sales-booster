import { useDispatch, useSelect } from '@wordpress/data';

import { __ } from "@wordpress/i18n";
import {addFilter} from "@wordpress/hooks";
import { createPopupForm, noop } from '../helper';
import TextAreaBox from "../../../../../../assets/src/components/settings/Panels/PanelSettings/Fields/TextAreaBox";
import SettingsSection from "../../../../../../assets/src/components/settings/Panels/PanelSettings/SettingsSection";
import ActionsHandler from "sales-booster/src/components/settings/Panels/PanelSettings/ActionsHandler";
import { Fragment } from "react";

function Message( { onFormSave, upgradeTeaser } ) {
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
    <Fragment>
      <SettingsSection>
        <TextAreaBox
          areaRows={ 4 }
          name={ 'message_popup' }
          needUpgrade={ upgradeTeaser }
          fieldValue={ createPopupFormData.message_popup }
          changeHandler={ upgradeTeaser ? noop : onFieldChange }
          title={ __( 'Message Popup', 'storegrowth-sales-booster' ) }
          placeHolderText={ __( 'Enter Message Popup', 'storegrowth-sales-booster' ) }
        />
      </SettingsSection>

      <ActionsHandler
        resetHandler={ onFormReset }
        loadingHandler={ getButtonLoading }
        saveHandler={ () => onFormSave( 'message' ) }
      />
    </Fragment>
  );
}

export default Message;
