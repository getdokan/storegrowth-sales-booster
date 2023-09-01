import { addFilter } from '@wordpress/hooks';
import { StockOutlined } from '@ant-design/icons';
import StockBar from './components/StockBar';

/**
 * Add routes to sidebar.
 */
addFilter( 'sgsb_routes', 'sgsb', (routes) => {
  routes.push({
    path: "/stock-bar",
    element: <StockBar />,
    name: 'stock-bar',
    label: "Stock Bar",
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
