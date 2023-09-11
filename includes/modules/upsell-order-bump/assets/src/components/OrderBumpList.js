import { __ } from '@wordpress/i18n';
import { Table, Button, notification } from 'antd';
import { useDispatch, useSelect } from '@wordpress/data';
import { useEffect, useState } from '@wordpress/element';
import { convertBumpItemHtmlEntitiesToTexts } from '../helper';

const deleteBump = stateUpdateCallback => id  => {
    stateUpdateCallback( true );
    jQuery.post( bump_save_url.ajax_url, {
      'action': 'bump_delete',
      'data': id,
      '_ajax_nonce': bump_save_url.ajd_nonce
    }, function () {
      notification[ 'error' ]( {
        message: 'Order Bump deleted',
      } );
      stateUpdateCallback( false );
      location.reload();
    } );
  }

function ActionButton( { navigate, bump_id } ) {
  const [ buttonLoading, setButtonLoading ] = useState( false );

  return (
    <>
      <Button
        type="primary"
        shape="round"
        size='small'
        onClick={ () => navigate( "/upsell-order-bump/" + bump_id ) }>
        Edit
      </Button> |&nbsp;
      <Button
        type="danger"
        shape="round"
        size='small'
        onClick={ () => deleteBump( setButtonLoading )( bump_id ) }
        loading={ buttonLoading }
      >
        Delete
      </Button>
    </>
  );
}

function TargetProductAndCategory( { catList, productList } ) {
  return (
    <>
      {
        productList ? <div style={ {
          background: '#E2E6F1',
          padding: '5px',
          borderRadius: '5px',
          marginTop: '5px'
        } }
        >
          <b>Target Products </b><br />
          { productList }
        </div> : null
      }

      {
        catList ? <div style={ {
          background: '#D8E1F6',
          padding: '5px',
          borderRadius: '5px',
          marginTop: '10px'
        } }>
          <b>Target Categories </b><br />
          { catList }
        </div> : null
      }
    </>
  );
}


function OrderBumpList( { navigate } ) {

  const { setPageLoading } = useDispatch( 'sgsb' );
  const { setBumpData } = useDispatch( 'sgsb_order_bump' )

  const { bumpListData } = useSelect( ( select ) => ({
    bumpListData: select( 'sgsb_order_bump' ).getBumpData()
  }) );


  useEffect( () => {
    setPageLoading( true );

    jQuery.post( bump_save_url.ajax_url, {
      'action': 'bump_list',
      'data': [],
      '_ajax_nonce': bump_save_url.ajd_nonce
    }, function ( bumpDataFromAjax ) {
      setPageLoading( false );

      const bumpDataParsed = bumpDataFromAjax.data.map(bumpItem => convertBumpItemHtmlEntitiesToTexts(bumpItem));
      setBumpData( bumpDataParsed );
    } );
  }, [] );



  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      align: 'left',
    },
    {
      title: 'Target Product(s) and Cetegories',
      dataIndex: 'product_category',
    },
    {
      title: 'Offers',
      dataIndex: 'offers',
    },
    {
      title: 'Action',
      dataIndex: 'action',
    },
  ];

  let catInfoByCatId = products_and_categories.category_list.catNameById
  let productInfoById = products_and_categories.product_list.productTitleById
 
  function mapBumpData(item) {
    let categories = item.target_categories;
    let catList = '';
  
    for (const key in categories) {
      if (Object.keys(categories).length - 1 > key) {
        catList = catList + catInfoByCatId[categories[key]] + ', ';
      } else {
        catList = catList + catInfoByCatId[categories[key]];
      }
    }
  
    let products = item.target_products;
    let productList = '';
  
    for (const key in products) {
      if (Object.keys(products).length - 1 > key) {
        productList = productList + productInfoById[products[key]] + '( #' + products[key] + ' )' + ', ';
      } else {
        productList = productList + productInfoById[products[key]] + '( #' + products[key] + ' )';
      }
    }
  
    let offerProduct = productInfoById[item.offer_product];
    return {
      key: item,
      name: item.name_of_order_bump,
      product_category: <TargetProductAndCategory catList={catList} productList={productList} />,
      offers: offerProduct,
      action: <ActionButton
        navigate={navigate}
        bump_id={item.id}
      />,
    };
  }
  
  let data;
  
  if ( sgsbAdmin.isPro ) {
    data = bumpListData.map( mapBumpData );
  } else {
    data = bumpListData.slice( -2 ).map( mapBumpData );
  }

  const isDisableBumpCreation = bumpListData?.length >= 2 && !sgsbAdmin.isPro;

  console.log( data );

  return (
    <div className={ `upsell-order-list-table` }>
      { isDisableBumpCreation && (
        <span className='sgsb-order-bumps-limit-warning-message'>
          { __( 'Upgrade to premium to create more than two order bumps.', 'storegrowth-sales-booster' ) }
        </span>
      ) }
      <Table
        columns={ columns }
        dataSource={ data }
        bordered
      />
    </div>
  )

}

export default OrderBumpList;
