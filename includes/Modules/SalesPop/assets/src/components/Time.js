import { useDispatch, useSelect } from '@wordpress/data';

import { Fragment } from "react";
import { applyFilters } from "@wordpress/hooks";
import { createPopupForm, noop } from '../helper';
import ActionsHandler from "sales-booster/src/components/settings/Panels/PanelSettings/ActionsHandler";

function Time( { onFormSave, upgradeTeaser } ) {
  const { setCreateFromData } = useDispatch( 'sgsb_order_sales_pop' );

  const { createPopupFormData, getButtonLoading } = useSelect( ( select ) => ({
    createPopupFormData : select( 'sgsb_order_sales_pop' ).getCreateFromData(),
    getButtonLoading    : select( 'sgsb_order_sales_pop' ).getButtonLoading()
  }) );

  const onFormReset = () => {
    setCreateFromData( { ...createPopupForm } );
  }

  return (
    <Fragment>
      {/* Rendered sales pop time panel settings. */}
      { applyFilters(
        'sgsb_sales_pop_time_panel_settings',
        '',
        createPopupFormData,
        setCreateFromData
      ) }

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
