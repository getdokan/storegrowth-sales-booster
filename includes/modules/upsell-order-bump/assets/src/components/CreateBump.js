import { Form, notification, Collapse, Button, Modal } from 'antd';
import { useDispatch, useSelect } from '@wordpress/data';
import { useEffect,useState } from '@wordpress/element';
import { convertBumpItemHtmlEntitiesToTexts, convertBumpItemTextDatasToHtmlEntities } from '../helper';
import OfferSection from './OfferSection';
import BasicInfo from './BasicInfo';
import DesignChangeArea from './appearance/template/design-area/DesignChangeArea';
import ContentBump from './appearance/ContentBump';
import OverViewArea from './appearance/template/overview-area/OverViewArea';

const { Panel } = Collapse;

function CreateBump({navigate, useParams}) {
  const [allBumpsData, setallBumpsData] = useState([]);
  const [duplicateDataError, setDuplicateDataError] = useState({});
  const [isModalVisible, setIsModalVisible] = useState(false);
  const { setPageLoading } = useDispatch( 'sgsb' );
  const [buttonLoading, setButtonLoading] = useState(false);
  const { setCreateFromData, resetCreateFromData } = useDispatch( 'sgsb_order_bump' );
  let {bump_id,action_name} = useParams();

  const { bumpData, createBumpData } = useSelect( ( select ) => ({
    createBumpData: select('sgsb_order_bump').getCreateFromData(),
    bumpData: wp.data.select('sgsb_order_bump').getBumpData()
  }));

  useEffect(() => {
    if(!bumpData?.length > 0){
        setPageLoading( true );
        jQuery.post( bump_save_url.ajax_url, {
            'action': 'bump_list',
            'data': [],
            '_ajax_nonce': bump_save_url.ajd_nonce
            }, function ( bumpDataFromAjax ) {
            setPageLoading( false );
            const bumpDataParsed = bumpDataFromAjax.data.map(bumpItem => convertBumpItemHtmlEntitiesToTexts(bumpItem));
            setallBumpsData( bumpDataParsed );
        } );
    }else{
        setallBumpsData( bumpData );
    }
  }, [])


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

      const parsedBumpItem = convertBumpItemHtmlEntitiesToTexts(data.data)
      setCreateFromData({
        ...createBumpData,
        ...parsedBumpItem,
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

    const isEditingExistingBumpItem = typeof bump_id == "string" && 
            !isNaN(bump_id) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)
            !isNaN(parseFloat(bump_id)) // if bump_id is just whitespaces then fail
    const intBumpId = isEditingExistingBumpItem && parseInt(bump_id);
    const filteredBumpsData = isEditingExistingBumpItem ? allBumpsData.filter(item => item.id !== intBumpId) : allBumpsData;

    const duplicateErrs = {
        duplicateTargetCats: [],
        duplicateTargetProducts: [],
    }

    const newOfferProduct = createBumpData.offer_product;
    const newTargetCats = createBumpData.target_categories;
    const newTargetProducts = createBumpData.target_products;
    const newTargetSchedules = createBumpData.bump_schedule;
    
    for (const bumpItem of filteredBumpsData) {
        if(bumpItem.offer_product !== newOfferProduct){
            continue;
        }
        let isSameScheduleExist = false;
        for (const newScheduleItem of newTargetSchedules) {
            if(bumpItem.bump_schedule.includes(newScheduleItem)){
                isSameScheduleExist = true;
                break;
            }
        }
        if(!isSameScheduleExist){
            continue;
        }
        for (const newCatItem of newTargetCats) {
            if(bumpItem.target_categories.includes(newCatItem)){
                duplicateErrs.duplicateTargetCats.push(newCatItem);
                break;
            }
        }
        for (const newProductItem of newTargetProducts) {
            if(bumpItem.target_products.includes(newProductItem)){
                duplicateErrs.duplicateTargetProducts.push(newProductItem);
                break;
            }
        }
        if(duplicateErrs.duplicateTargetCats.length > 0 || duplicateErrs.duplicateTargetProducts.length > 0 ){
            setDuplicateDataError(duplicateErrs);
            return false;
        }
    }
    
    setButtonLoading( true );
    const bumpDataParsedToEntities = convertBumpItemTextDatasToHtmlEntities(createBumpData);
    let $ = jQuery;
    $.post( bump_save_url.ajax_url, { 
      'action'    : 'bump_create',
      'data'      : bumpDataParsedToEntities,
      '_ajax_nonce' : bump_save_url.ajd_nonce

      }, function ( data ) {
      console.log('created bump', data)
      setCreateFromData( {
        ...bumpDataParsedToEntities,
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

  const clearErrors = () => setDuplicateDataError({});
  const isDuplicateCatsFound = duplicateDataError?.duplicateTargetCats?.length > 0;
  const isDuplicateProductsFound = duplicateDataError?.duplicateTargetProducts?.length > 0;

  return (
    <>
      <Form {...layout} >
        <Collapse onChange={onChange} defaultActiveKey="1">
          <Panel header="Basic Informarion form" key="1">
            <BasicInfo clearErrors={clearErrors} />
          </Panel>

          <Panel header="Offer Section Form" key="2">
            <OfferSection clearErrors={clearErrors} />
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
        {
            ( isDuplicateCatsFound || isDuplicateProductsFound ) && (
                <h3 style={{color:"Red"}}>
                    Error!!! another bump with the given offer product for the specified schedule already exists for the selected {" "}
                    {
                    (isDuplicateCatsFound && isDuplicateProductsFound) 
                        ? "categories & products" 
                        : isDuplicateProductsFound 
                            ? "products"
                            : "categories"
                    }
                    .<br/>
                    Please change your inputs and then try again.
                </h3>
            )
        }
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
