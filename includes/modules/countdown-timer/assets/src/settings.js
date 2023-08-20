import { addFilter } from '@wordpress/hooks';
import StockCountdown from './components/StockCountdown';
import { StockOutlined } from '@ant-design/icons';

/**
 * Add routes to sidebar.
 */
addFilter( 'sgsb_routes', 'sgsb', (routes) => {
  routes.push({
    path: "/countdown-timer",
    element: <StockCountdown />,
    name: 'countdown-timer',
  });

  return routes;
} );

/**
 * Add sidebar menu items
 */
 addFilter( 'sidebar_menu_items', 'sgsb', (items, Link) => {
  items.push( {
    label: <Link to="/countdown-timer">Sales Countdown</Link>,
    key: 'countdown-timer',
    icon: <StockOutlined />,
  } );

  return items;
} );
