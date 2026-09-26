/**
 * Webpack entry points (ADR-001).
 *
 * Every entry is listed by hand. When a module or integration moves to the new
 * admin UI, add its entry to `moduleEntries` / `integrationEntries`.
 *
 * Output: core bundles in `build/`, module bundles in
 * `modules/<id>/assets/js/`, integration bundles in `build/integrations/`.
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
 * A module bundle, written to `modules/<id>/assets/js/<bundle>.js` (+ its
 * `.asset.php`). Entry names are relative to `build/`, so webpack's clean
 * step (which only clears `build/`) never touches module folders. The
 * generated names are git-ignored in `.gitignore`; hand-written storefront
 * scripts in `assets/js/` must not use them.
 *
 * @param {string} id     Module id.
 * @param {string} bundle Bundle name, e.g. `admin`.
 * @param {string} source Entry file.
 * @return {Object} Entry map.
 */
const moduleEntry = ( id, bundle, source ) => ( {
    [ `../modules/${ id }/assets/js/${ bundle }` ]: source,
} );

const moduleEntries = {
    ...moduleEntry(
        'stock-bar',
        'admin',
        './modules/stock-bar/src/admin/index.tsx'
    ),
    ...moduleEntry(
        'countdown-timer',
        'admin',
        './modules/countdown-timer/src/admin/index.tsx'
    ),
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
