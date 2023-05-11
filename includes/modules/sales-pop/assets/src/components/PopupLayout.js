import { Tabs, notification } from 'antd';

const { TabPane } = Tabs;
import { useDispatch, useSelect } from '@wordpress/data';
import CreateSalesPop from './CreateSalesPop';
import Desgin from './Design';
import Time from './Time';
import General from './General';
import Message from './Message';
import { State, City } from 'country-state-city';

function PopupLayout( { outlet: Outlet, navigate, useSearchParams } ) {
  const { setCreateFromData, setButtonLoading } = useDispatch( 'storepulse_sales_booster_order_sales_pop' );
  let [ searchParams, setSearchParams ] = useSearchParams();

  const tabName = searchParams.get( 'tab_name' )
  const { createPopupForm } = useSelect( ( select ) => ({
    createPopupForm: select( 'storepulse_sales_booster_order_sales_pop' ).getCreateFromData()
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

    // We are running a log job so having delay.
    setTimeout(() => {
      const allState = State.getAllStates();
      const StateWithoutCity = [];
      var i = 0;
      allState.map( ( item, k ) => {
        if ( City.getCitiesOfState( item.countryCode, item.isoCode ).length == 0 ) {
          StateWithoutCity[ i ] = item.countryCode + '#' + item.isoCode;
          i++;
        }
      } )

      jQuery.post(
        sales_pop_data.ajax_url,
        {
          'action': 'create_popup',
          'data': JSON.stringify( { 'popup_data': createPopupForm, state_without_city: StateWithoutCity } ),
          '_ajax_nonce': sales_pop_data.ajd_nonce
        },
        function ( response ) {
          setCreateFromData( response.data );
          setButtonLoading( false );
          notificationMessage( type );
        }
      );
    }, 1000);
  }

  return (
    <>
      <Tabs activeKey={ tabName ? tabName : 'general' } onTabClick={ changeTab }>
        <TabPane tab="General" key="general">
          <General onFormSave={ onFormSave } />
        </TabPane>

        <TabPane tab="Design" key="design">
          <Desgin onFormSave={ onFormSave } />
        </TabPane>

        <TabPane tab="Products" key="products">
          <CreateSalesPop onFormSave={ onFormSave } />
        </TabPane>

        <TabPane tab="Message" key="message">
          <Message onFormSave={ onFormSave } />
        </TabPane>

        <TabPane tab="Time" key="time">
          <Time onFormSave={ onFormSave } />
        </TabPane>
      </Tabs>
    </>
  );
}

export default PopupLayout;
