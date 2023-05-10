import { Form, Input, Select, notification, Collapse, Button, Modal } from 'antd';
import { useDispatch, useSelect } from '@wordpress/data';
import { useEffect,useState } from '@wordpress/element';
import OfferSection from './OfferSection';
import BasicInfo from './BasicInfo';
import AppearanceBump from './appearance/AppearanceBump';
import DesignChangeArea from './appearance/template/design-area/DesignChangeArea';
import ContentBump from './appearance/ContentBump';
import OverViewArea from './appearance/template/overview-area/OverViewArea';
const { Option } = Select;

const { Panel } = Collapse;
const text = `
  A dog is a type of domesticated animal.
  Known for its loyalty and faithfulness,
  it can be found as a welcome guest in many households across the world.
`;

function CreateBump({navigate, useParams}) {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const { setPageLoading } = useDispatch( 'spsb' );
  const [buttonLoading, setButtonLoading] = useState(false);
  const { setCreateFromData, resetCreateFromData } = useDispatch( 'spsb_order_bump' );
  let {bump_id,action_name} = useParams();

  const { createBumpData } = useSelect( ( select ) => ({
    createBumpData: select('spsb_order_bump').getCreateFromData()
  }));


  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleOk = () => {
    setIsModalVisible(false);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };


  const onChange = (key) => {
    console.log(key);
  };

 
  if( action_name == 'delete' ) {
    setPageLoading(true);
    let $ = jQuery;
    $.post( bump_save_url.ajax_url, { 'action': 'bump_delete', 'data': bump_id, '_ajax_nonce' : bump_save_url.ajd_nonce }, function ( data ) {
      setPageLoading(false);
      notification['error'] ( {
        message: 'Order Bump deleted',
      } );
      navigate("/upsell-order-bump");
    });
  }

  if( bump_id ) {

    useEffect( () => {
      setPageLoading( true );
      let $ = jQuery;
     $.post( bump_save_url.ajax_url, { 'action': 'bump_list', 'data': bump_id, '_ajax_nonce' : bump_save_url.ajd_nonce }, function ( data ) {
      console.log('Bangladesh',data)
      setPageLoading(false);

      setCreateFromData({
        ...createBumpData,
        ...data.data,
        offer_product_id:bump_id
      });
       
    } );

    
    }, []);

  } else {
    useEffect( () => {
      resetCreateFromData();    
    }, []);
  }

  const layout = {
    labelCol: {
      span: 8,
    },
    wrapperCol: {
      span: 15,
    },
  };

 

  const onFormSave = () => {

    if( !createBumpData.name_of_order_bump ) {
      notification['error'] ( {
        message: 'Please enter name of order bump',
      } );
      return null;
    }

    
    if ( createBumpData.target_products.length == 0 && createBumpData.target_categories.length == 0 ){
      notification['error'] ( {
        message: 'You have to select target products or target categories or both',
      } );
      
      return null;
      
    }

    if ( createBumpData.bump_schedule.length == 0 ){
      notification['error'] ( {
        message: 'Please select bump schedule',
      } );
      
      return null;
      
    }

    if ( !createBumpData.offer_product ) {
      notification['error'] ( {
        message: 'Please select offer product',
      } );
      
      return null;
      
    }

    if( createBumpData.offer_type.length ==0 ) {
      notification['error'] ( {
        message: 'Please select offer type',
      } );
      
      return null;
      
    }

    if(!createBumpData.offer_amount ){
      notification['error'] ( {
        message: 'Please select offer amount',
      } );
      
      return null;
      
    }

    setButtonLoading( true );
    let $ = jQuery;
    $.post( bump_save_url.ajax_url, { 
      'action'    : 'bump_create',
      'data'      : createBumpData,
      '_ajax_nonce' : bump_save_url.ajd_nonce

      }, function ( data ) {
      console.log('created bump', data)
      setCreateFromData( {
        ...createBumpData,
        offer_product_id: data
      } );
      setButtonLoading( false );

      notification['success']({
        message     : 'Order Bump Creation',
        description : 'Data for order bump creation saved successfully',
      });

      navigate( "/upsell-order-bump" );
    });

  }

  return (
    <>
      <Form {...layout} >
        <Collapse onChange={onChange} defaultActiveKey="1">
          <Panel header="Basic Informarion form" key="1">
            <BasicInfo product_list = {products_and_categories.product_list}/>
          </Panel>

          <Panel header="Offer Section Form" key="2">
            <OfferSection product_list = {products_and_categories.product_list}/>
          </Panel>

          <Panel header="Design Section" key="4">
            <Collapse >
              <Panel header="Template Section" key="4">
                <DesignChangeArea onFormSave = {onFormSave} buttonLoading = {buttonLoading} />
              </Panel>
              <Panel header="Content Section" key="5">
                <ContentBump onFormSave = {onFormSave} buttonLoading = {buttonLoading} />
              </Panel>

            </Collapse>
          </Panel>
        
        </Collapse>

        <Button 
          type      = "primary" 
          htmlType  = "submit" 
          className = 'order-bump-save-change-button'
          onClick   = {()=>onFormSave()}
          loading   = {buttonLoading}    
        >
            Save Changes
        </Button>

        <Button type="info" onClick={showModal} style={{marginLeft:'5px'}}>
          Bump Overview
        </Button>
        <Modal title="Bump Overview Section" visible={isModalVisible} onOk={handleOk} onCancel={handleCancel}>
          <OverViewArea/>
        </Modal>
      </Form>
    </>
  );
}

export default CreateBump;
