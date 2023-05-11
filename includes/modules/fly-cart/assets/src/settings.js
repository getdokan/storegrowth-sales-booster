import { addFilter } from '@wordpress/hooks';
import FlyCart from './components/FlyCart';
import { ShoppingCartOutlined } from '@ant-design/icons';

/**
 * Add routes to sidebar.
 */
addFilter( 'storepulse_sales_booster_routes', 'storepulse_sales_booster', (routes) => {
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
addFilter( 'sidebar_menu_items', 'storepulse_sales_booster', (items, Link) => {
  items.push( {
    label: <Link to="/fly-cart">Fly Cart</Link>,
    key: 'fly-cart',
    icon: <ShoppingCartOutlined />,
  } );

  return items;
} );
