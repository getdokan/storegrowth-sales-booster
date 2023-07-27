import { addFilter } from '@wordpress/hooks';
import { StockOutlined } from '@ant-design/icons';
import DirectCheckout from './components/DirectCheckout';

/**
 * Add routes to sidebar.
 */
addFilter( 'sgsb_routes', 'sgsb', (routes) => {
  routes.push({
    path: "/direct-checkout",
    element: <DirectCheckout />,
    name: 'direct-checkout',
  });

  return routes;
} );

/**
 * Add sidebar menu items
 */
 addFilter( 'sidebar_menu_items', 'sgsb', (items, Link) => {
  items.push( {
    label: <Link to="/direct-checkout">Direct Checkout</Link>,
    key: 'direct-checkout',
    icon: <StockOutlined />,
  } );

  return items;
} );
