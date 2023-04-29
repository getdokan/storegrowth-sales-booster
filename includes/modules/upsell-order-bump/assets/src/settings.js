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
addFilter( 'sbfw_routes', 'sbfw', (routes, outlet, navigate,useParams) => {
  routes.push( {
    path: "/upsell-order-bump",
    exact:true,
    name: 'upsell-order-bump',
    element: <OrderBump outlet={outlet} navigate={navigate} useParams={useParams} />,
    children: [
      {
        index: true,
        element: <OrderBumpList navigate={navigate} />
      },
      {
        path: "create-bump",
        element: <CreateBump navigate={navigate} useParams={useParams} />
      },
      {
        path: ":bump_id",
        element: <CreateBump navigate={navigate} useParams={useParams} />
      },
      {
        path: ":action_name/:bump_id",
        element: <CreateBump navigate={navigate} useParams={useParams} />
      },
    ]
  } );

  return routes;
} );

/**
 * Add sidebar menu items
 */
addFilter( 'sidebar_menu_items', 'sbfw', (items, Link) => {
  items.push( {
    label: <Link to="/upsell-order-bump">Order Bump</Link>,
    key: 'upsell-order-bump',
    icon: <ShoppingCartOutlined />,
  } );

  return items;
} );
