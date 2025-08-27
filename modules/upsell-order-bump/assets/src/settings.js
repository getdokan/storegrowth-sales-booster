import { addFilter } from '@wordpress/hooks';
import OrderBump from './components/OrderBump';
import { ShoppingCartOutlined } from '@ant-design/icons';
import OrderBumpList from './components/OrderBumpList';
import CreateBump from './components/CreateBump';
import { register } from '@wordpress/data';


import OrderBumpStore from './store';

register( OrderBumpStore );


/**
 * Add routes to sidebar.
 */
addFilter( 'sgsb_routes', 'sgsb', (routes, outlet, navigate,useParams,useSearchParams) => {
  const moduleName = 'upsell-order-bump';

  routes.push( {
    name: moduleName,
    label:"Upsell Order Bump",
    path: "/upsell-order-bump",
    exact:true,
    element: <OrderBump outlet={outlet} navigate={navigate} useParams={useParams} moduleId={moduleName}/>,
    children: [
      {
        index: true,
        element: <OrderBumpList navigate={navigate} />
      },
      {
        path: "create-bump",
        element: <CreateBump navigate={navigate} useParams={useParams} useSearchParams={useSearchParams} />
      },
      {
        path: ":bump_id",
        element: <CreateBump navigate={navigate} useParams={useParams} useSearchParams={useSearchParams} />
      },
      {
        path: ":action_name/:bump_id",
        element: <CreateBump navigate={navigate} useParams={useParams} useSearchParams={useSearchParams} />
      },
    ]
  } );

  return routes;
} );

/**
 * Add sidebar menu items
 */
addFilter( 'sidebar_menu_items', 'sgsb', (items, Link) => {
  items.push( {
    label: <Link to="/upsell-order-bump">Upsell Order Bump</Link>,
    key: 'upsell-order-bump',
    icon: <ShoppingCartOutlined />,
  } );

  return items;
} );
