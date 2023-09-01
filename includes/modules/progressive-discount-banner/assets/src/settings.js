import { addFilter } from '@wordpress/hooks';
import DiscountBannerLayout from './components/DiscountBannerLayout';
import { InsertRowAboveOutlined } from '@ant-design/icons';

/**
 * Add routes to sidebar.
 */
addFilter('sgsb_routes', 'sgsb', (routes) => {
	routes.push({
		path: '/progressive-discount-banner',
		element: <DiscountBannerLayout />,
		name: 'progressive-discount-banner',
		label: 'Free Shipping Bar',
	});

	return routes;
});

/**
 * Add sidebar menu items
 */
addFilter('sidebar_menu_items', 'sgsb', (items, Link) => {
	items.push({
		label: <Link to="/progressive-discount-banner">Discount Banner</Link>,
		key: 'progressive-discount-banner',
		icon: <InsertRowAboveOutlined />,
	});

	return items;
});
