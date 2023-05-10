import { addFilter } from '@wordpress/hooks';
import FlyCart from './components/FlyCart';
import { ShoppingCartOutlined } from '@ant-design/icons';

/**
 * Add routes to sidebar.
 */
addFilter( 'spsb_routes', 'spsb', (routes) => {
  routes.push( {
    path: "/fly-cart",
    element: <FlyCart />,
    name: 'fly-cart',
  } );

  return routes;
} );

/**
 * Add sidebar menu items
 */
addFilter( 'sidebar_menu_items', 'spsb', (items, Link) => {
  items.push( {
    label: <Link to="/fly-cart">Fly Cart</Link>,
    key: 'fly-cart',
    icon: <ShoppingCartOutlined />,
  } );

  return items;
} );
