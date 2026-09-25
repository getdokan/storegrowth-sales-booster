/**
 * Webpack entry points (ADR-001).
 *
 * Every entry is listed by hand. When a module or integration moves to the new
 * admin UI, add its entry to `moduleEntries` / `integrationEntries`.
 *
 * Output: core bundles in `build/`, module bundles in `build/modules/<id>/`,
 * integration bundles in `build/integrations/`.
 *
 * @since SPSG_VERSION
 */

/**
 * Core bundles. The shared ones are exposed on `window.storegrowth.*` and
 * mapped from bare `@storegrowth/*` / `@wedevs/plugin-ui` imports in
 * webpack-dependency-mapping.js, so every consumer shares one copy.
 */
const coreEntries = {
    tailwind: './src/base-tailwind.css',
    admin: './src/admin/index.tsx',
    header: './src/header/index.tsx',
    'plugin-ui': {
        import: './src/externals/plugin-ui.js',
        library: { name: [ 'storegrowth', 'pluginUI' ], type: 'window' },
    },
    components: {
        import: './src/components/index.ts',
        library: { name: [ 'storegrowth', 'components' ], type: 'window' },
    },
    utilities: {
        import: './src/utilities/index.ts',
        library: { name: [ 'storegrowth', 'utilities' ], type: 'window' },
    },
    hooks: {
        import: './src/hooks/index.ts',
        library: { name: [ 'storegrowth', 'hooks' ], type: 'window' },
    },
};

/**
 * Module bundles, e.g.
 * 'modules/upsell-order-bump/blocks': './modules/upsell-order-bump/src/blocks/index.tsx',
 */
const moduleEntries = {
    'modules/stock-bar/admin': './modules/stock-bar/src/index.tsx',
};

/**
 * Integration bundles, e.g.
 * 'integrations/bogo-dokan-dashboard': './integrations/src/bogo-dokan-dashboard/index.tsx',
 */
const integrationEntries = {};

module.exports = {
    ...coreEntries,
    ...moduleEntries,
    ...integrationEntries,
};
