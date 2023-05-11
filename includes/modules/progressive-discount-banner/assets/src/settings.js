import { addFilter } from '@wordpress/hooks';
import DiscountBannerLayout from './components/DiscountBannerLayout';
import { InsertRowAboveOutlined } from '@ant-design/icons';

/**
 * Add routes to sidebar.
 */
addFilter('storepulse_sales_booster_routes', 'storepulse_sales_booster', (routes) => {
	routes.push({
		path: '/progressive-discount-banner',
		element: <DiscountBannerLayout />,
		name: 'progressive-discount-banner',
	});

	return routes;
});

/**
 * Add sidebar menu items
 */
addFilter('sidebar_menu_items', 'storepulse_sales_booster', (items, Link) => {
	items.push({
		label: <Link to="/progressive-discount-banner">Discount Banner</Link>,
		key: 'progressive-discount-banner',
		icon: <InsertRowAboveOutlined />,
	});

	return items;
});
