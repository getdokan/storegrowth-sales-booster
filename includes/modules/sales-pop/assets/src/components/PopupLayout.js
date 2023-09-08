import { __ } from '@wordpress/i18n';
import { notification } from 'antd';

import { useDispatch, useSelect } from '@wordpress/data';
import CreateSalesPop from './CreateSalesPop';
import Design from './Design';
import Time from './Time';
import General from './General';
import Message from './Message';

import PanelHeader from "../../../../../../assets/src/components/settings/Panels/PanelHeader";
import PanelContainer from "../../../../../../assets/src/components/settings/Panels/PanelContainer";
import PanelRow from "../../../../../../assets/src/components/settings/Panels/PanelRow";
import PanelPreview from "../../../../../../assets/src/components/settings/Panels/PanelPreview";
import PanelSettings from "../../../../../../assets/src/components/settings/Panels/PanelSettings";
import Preview from "./Preview";

function PopupLayout( { outlet: Outlet, navigate, useSearchParams } ) {

  const isProEnabled = sgsbAdmin.isPro;
  const upgradeTeaser = !isProEnabled && <span className="sgsb-field-upgrade-pro-label">(Upgrade to premium)</span>;

  const { setCreateFromData, setButtonLoading } = useDispatch( 'sgsb_order_sales_pop' );
  let [ searchParams, setSearchParams ] = useSearchParams();

  const tabName = searchParams.get( 'tab_name' )
  const { createPopupForm } = useSelect( ( select ) => ({
    createPopupForm: select( 'sgsb_order_sales_pop' ).getCreateFromData()
  }) );

  const changeTab = ( key ) => {
    navigate( "/sales-pop?tab_name=" + key );
  };

  const notificationMessage = ( type ) => {

    if ( type == 'general_settings' ) {
      notification[ 'success' ]( {
        message: 'General Settings Section',
        description: 'General section settings data updated successfully.',
      } );
    }

    if ( type == 'design' ) {
      notification[ 'success' ]( {
        message: 'Design Section',
        description: 'Design section data updated successfully.',
      } );
    }

    if ( type == 'message' ) {
      notification[ 'success' ]( {
        message: 'Message Section',
        description: 'Message section data updated successfully.',
      } );
    }

    if ( type == 'product' ) {
      notification[ 'success' ]( {
        message: 'Product Section',
        description: 'Product section data updated successfully.',
      } );
    }

    if ( type == 'time' ) {
      notification[ 'success' ]( {
        message: 'Time Section',
        description: 'Time section data updated successfully.',
      } );
    }

  }

  const onFormSave = ( type ) => {
    setButtonLoading( true );


    jQuery.post(
        sales_pop_data.ajax_url,
        {
          'action': 'create_popup',
          'data': JSON.stringify( { 'popup_data': createPopupForm} ),
          '_ajax_nonce': sales_pop_data.ajd_nonce
        },
        function ( response ) {
          setCreateFromData( response.data );
          setButtonLoading( false );
          notificationMessage( type );
        }
      );
  }

  const tabPanels = [
    {
      key: 'general',
      title: __( 'Sales Pop Setting', 'storegrowth-sales-booster' ),
      panel: <General onFormSave={ onFormSave } upgradeTeaser={ !isProEnabled } />,
    },
    // {
    //   key: 'template',
    //   title: __( 'Template', 'storegrowth-sales-booster' ),
    //     panel: <Fragment></Fragment>,
    // },
    {
      key: 'design',
      title: __( 'Design', 'storegrowth-sales-booster' ),
      panel: <Design onFormSave={ onFormSave } upgradeTeaser={ !isProEnabled } />,
    },
    {
      key: 'products',
      title: __( 'Products', 'storegrowth-sales-booster' ),
      panel: <CreateSalesPop onFormSave={ onFormSave } upgradeTeaser={ !isProEnabled } />,
    },
    {
      key: 'message',
      title: __( 'Message', 'storegrowth-sales-booster' ),
      panel: <Message onFormSave={ onFormSave } upgradeTeaser={ !isProEnabled } />,
    },
    {
      key: 'time',
      title: __( 'Time', 'storegrowth-sales-booster' ),
      panel: <Time onFormSave={ onFormSave } upgradeTeaser={ !isProEnabled } />,
    },
  ];

  const excludeTabs = [ 'general', 'products', 'message', 'time' ];
  const showPreview = ! excludeTabs?.includes( tabName );

  return (
    <>
      <PanelHeader
        title={ __( 'Sales Pop Setting', 'storegrowth-sales-booster' ) }
      />
      <PanelContainer>
        <PanelRow>
          <PanelSettings
            colSpan={ showPreview && tabName ? 14 : 24 }
            tabPanels={ tabPanels }
            changeHandler={ changeTab }
            activeTab={ tabName ? tabName : 'general' }
          />
          { showPreview && tabName && (
            <PanelPreview colSpan={ 10 }>
              <Preview />
            </PanelPreview>
          ) }
        </PanelRow>
      </PanelContainer>
    </>
  );
}

export default PopupLayout;
