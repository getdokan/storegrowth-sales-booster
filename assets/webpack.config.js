const path = require('path');
const defaultConfig = require('@wordpress/scripts/config/webpack.config');

module.exports = {
    ...defaultConfig,
    entry: {
        ...defaultConfig.entry,
        'settings': './src/settings.js',
        'modules': './src/modules.js',
        'bogo-dokan-admin': './src/integrations/dokan/admin/bogo/index.tsx',
        'bogo-dokan-dashboard': './src/integrations/dokan/dashboard/bogo/index.tsx',
        'dokan-fly-cart': './src/integrations/dokan/admin/flycart/index.tsx',
        'dokan-countdown-timer': './src/integrations/dokan/admin/countdownTimer/index.tsx',
        'dokan-dashboard-products': './src/integrations/dokan/dashboard/products/index.js',
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
