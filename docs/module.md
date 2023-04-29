# Module Implementation

## Create a Module

1. Modules will be stored under `includes/modules` directory.
2. Every module should have a directory and a PHP file inside that directory. 
3. The PHP file should return an object of `Module_Skeleton` interface.

## Add Module Settings Page

Module Settings Page are created with `react` and `Ant Design`. So each module should have `wp-scripts` setup on its own `assets` directory.

1. Filter hook `sbfw_routes` is for registering routes.
2. Filter hook `sidebar_menu_items` is for add menu items to sidebar.

[Fly Cart Example](https://github.com/wpcodal/sales-boster-for-woocommerce/blob/feature/fly-cart/includes/modules/fly-cart/assets/src/settings.js)

[Sample package.json file](https://github.com/wpcodal/sales-boster-for-woocommerce/blob/feature/fly-cart/includes/modules/fly-cart/assets/package.json)
