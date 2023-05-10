import { addFilter } from '@wordpress/hooks';
import StockCountdown from './components/StockCountdown';
import { StockOutlined } from '@ant-design/icons';

/**
 * Add routes to sidebar.
 */
addFilter( 'spsb_routes', 'spsb', (routes) => {
  routes.push({
    path: "/stock-countdown",
    element: <StockCountdown />,
    name: 'stock-countdown',
  });

  return routes;
} );

/**
 * Add sidebar menu items
 */
 addFilter( 'sidebar_menu_items', 'spsb', (items, Link) => {
  items.push( {
    label: <Link to="/stock-countdown">Stock Countdown</Link>,
    key: 'stock-countdown',
    icon: <StockOutlined />,
  } );

  return items;
} );
