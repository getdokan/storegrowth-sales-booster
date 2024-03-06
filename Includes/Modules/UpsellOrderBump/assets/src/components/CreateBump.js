import { __ } from '@wordpress/i18n';
import { Form, notification } from 'antd';
import { useDispatch, useSelect } from '@wordpress/data';
import { useEffect,useState } from '@wordpress/element';
import { convertBumpItemHtmlEntitiesToTexts, convertBumpItemTextDatasToHtmlEntities } from '../helper';
import BasicInfo from './BasicInfo';
import PanelPreview from "sales-booster/src/components/settings/Panels/PanelPreview";
import PanelRow from "sales-booster/src/components/settings/Panels/PanelRow";
import PanelSettings from "sales-booster/src/components/settings/Panels/PanelSettings";
import DesignSection from "./DesignSection";
import Preview from "./Preview";
import { createBumpForm } from "../helper";
import ActionsHandler from "sales-booster/src/components/settings/Panels/PanelSettings/ActionsHandler";
import OverViewArea from "./appearance/template/overview-area/OverViewArea";
import TouchPreview from "sales-booster/src/components/settings/Panels/TouchPreview";

function CreateBump({navigate, useParams, useSearchParams}) {
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

  const changeTab = ( key ) => {
    navigate( "/upsell-order-bump/create-bump?tab_name=" + key );
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

    
    if ( createBumpData.bump_type === 'products' && createBumpData.target_products.length == 0 ){
      notification['error'] ( {
        message: 'You have to select target products for bump products type',
      } );
      
      return null;
    }

    if ( createBumpData.bump_type === 'categories' && createBumpData.target_categories.length == 0 ){
      notification['error'] ( {
        message: 'You have to select target categories for bump categories type',
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
        if( parseInt( bumpItem.offer_product ) !== parseInt( newOfferProduct ) ){
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
        if( ( duplicateErrs.duplicateTargetCats.length > 0 || duplicateErrs.duplicateTargetProducts.length > 0 ) ){
            if ( window.location.hash === '#/upsell-order-bump/create-bump' ) {
                setDuplicateDataError(duplicateErrs);
                return false;
            }
        }
    }

    // Check if bump order not duplicate then saved.
    if ( ! ( isDuplicateCatsFound || isDuplicateProductsFound ) ) {
      setButtonLoading( true );
      const bumpDataParsedToEntities = convertBumpItemTextDatasToHtmlEntities(createBumpData);
      let $ = jQuery;
      $.post( bump_save_url.ajax_url, {
          'action'    : 'bump_create',
          'data'      : bumpDataParsedToEntities,
          '_ajax_nonce' : bump_save_url.ajd_nonce
        }, function ( data ) {
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

  }

  const onFormReset = () => {
    setCreateFromData( { ...createBumpForm } );
  }

  const clearErrors = () => setDuplicateDataError({});
  const isDuplicateCatsFound = duplicateDataError?.duplicateTargetCats?.length > 0;
  const isDuplicateProductsFound = duplicateDataError?.duplicateTargetProducts?.length > 0;


  const [ searchParams, setSearchParams ] = useSearchParams();
  const tabName = searchParams.get( 'tab_name' );

  const tabPanels = [
    {
      key: 'basic',
      title: __( 'Basic Information', 'storegrowth-sales-booster' ),
      panel: <BasicInfo clearErrors={ clearErrors } />,
    },
    {
      key: 'design',
      title: __( 'Design', 'storegrowth-sales-booster' ),
      panel: <DesignSection />,
    },
  ];

  const excludeTabs = [ 'basic' ];
  const showPreview = ! excludeTabs?.includes( tabName );

  return (
    <>
      <Form {...layout} >
        <PanelRow>
          <PanelSettings
            colSpan={ showPreview && tabName ? 12 : 24 }
            tabPanels={ tabPanels }
            changeHandler={ changeTab }
            activeTab={ tabName ? tabName : 'basic' }
          />
          { showPreview && tabName && (
            <PanelPreview colSpan={ 12 }>
              <Preview storeData={ createBumpData } />
            </PanelPreview>
          ) }
        </PanelRow>

        {/* Render preview panel for responsive preview. */}
        <TouchPreview previewWidth={ 400 }>
          <Preview storeData={ createBumpData } />
        </TouchPreview>

        { ( isDuplicateCatsFound || isDuplicateProductsFound ) &&
          notification['error'] ( {
            message: __(
              `Error!!! another bump with the given offer product for the specified schedule already exists for the selected ${ ( isDuplicateCatsFound && isDuplicateProductsFound ) ? 'categories & products' : isDuplicateProductsFound ? 'products' : 'categories' }. Please change your inputs and then try again.`,
              'storegrowth-sales-booster'
            ),
          } )
        }

        <ActionsHandler
          saveHandler={ onFormSave }
          resetHandler={ onFormReset }
          loadingHandler={ buttonLoading }
        />

        {/*<Button type="info" onClick={showModal} style={{marginLeft:'5px'}}>*/}
        {/*  Bump Overview*/}
        {/*</Button>*/}
        {/*<Modal title="Bump Overview Section" visible={isModalVisible} onOk={handleOk} onCancel={handleCancel}>*/}
        {/*  <OverViewArea/>*/}
        {/*</Modal>*/}
      </Form>
    </>
  );
}

export default CreateBump;
