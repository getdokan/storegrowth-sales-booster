import { addFilter } from '@wordpress/hooks';
import StockCountdown from './components/StockCountdown';
import { StockOutlined } from '@ant-design/icons';

/**
 * Add routes to sidebar.
 */
addFilter( 'sgsb_routes', 'sgsb', (routes) => {
  routes.push({
    path: "/stock-bar",
    element: <StockCountdown />,
    name: 'stock-bar',
  });

  return routes;
} );

/**
 * Add sidebar menu items
 */
 addFilter( 'sidebar_menu_items', 'sgsb', (items, Link) => {
  items.push( {
    label: <Link to="/stock-bar">Stock Bar</Link>,
    key: 'stock-bar',
    icon: <StockOutlined />,
  } );

  return items;
} );
