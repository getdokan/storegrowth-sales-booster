import { addFilter } from '@wordpress/hooks';
import { ShoppingCartOutlined } from '@ant-design/icons';
import { register } from '@wordpress/data';
import SalesPop from './components/SalesPop';
import PopupLayout from './components/PopupLayout';


import SalesPopStore from './store';

register( SalesPopStore );


/**
 * Add routes to sidebar.
 */
addFilter( 'sgsb_routes', 'sgsb', (routes, outlet, navigate,useParams, useSearchParams) => {
	routes.push( {
		path: "/sales-pop",
		name: 'sales-pop',
		label: "Sales Pop",
		exact:true,
		element: <SalesPop 
		outlet={outlet} 
		navigate={navigate} 
		useParams={useParams} 
		useSearchParams={useSearchParams}
		 />,
		children: [
			{ 
				index: true, 
				element: <PopupLayout navigate={navigate} useParams={useParams} useSearchParams={useSearchParams}/> 
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
		label: <Link to="/sales-pop?tab_name=general">Sales Pop</Link>,
		key: 'sales-pop',
		icon: <ShoppingCartOutlined />,
	} );

	return items;
} );
