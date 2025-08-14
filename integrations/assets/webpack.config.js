const path = require('path');
const defaultConfig = require('@wordpress/scripts/config/webpack.config');

module.exports = {
    ...defaultConfig,
    entry: {
        ...defaultConfig.entry,
        'bogo-dokan-admin': './src/dokan/admin/bogo/index.tsx',
        'bogo-dokan-dashboard': './src/dokan/dashboard/bogo/index.tsx',
        'dokan-fly-cart': './src/dokan/admin/flycart/index.tsx',
        'dokan-countdown-timer': './src/dokan/admin/countdownTimer/index.tsx',
        'dokan-dashboard-products': './src/dokan/dashboard/products/index.js',
    },
    externals: {
        ...defaultConfig.externals,
        '@dokan/components': 'dokan.components',
    },
    output: {
        ...defaultConfig.output,
        path: path.resolve(__dirname, './build'),
        filename: '[name].js',
    },
};
