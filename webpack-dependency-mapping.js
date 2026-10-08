/**
 * Maps bare package imports to window globals and WordPress script handles.
 *
 * Shared bundles (plugin-ui and the `@storegrowth/*` libraries) are built once
 * as their own entries (see webpack-entries.js). Every other bundle imports
 * them by bare specifier; this mapping turns those imports into the globals and
 * adds the handle to the generated `.asset.php`, so WordPress loads the shared
 * bundle first and it is downloaded a single time.
 *
 * Follows dokan-lite's webpack-dependency-mapping.js.
 *
 * @since SPSG_VERSION
 */

/**
 * Shared bundles keyed by import specifier.
 *
 * @since SPSG_VERSION
 *
 * @type {Object.<string, {external: string[], handle: string}>}
 */
const SHARED_EXTERNALS = {
    '@wedevs/plugin-ui': {
        external: [ 'storegrowth', 'pluginUI' ],
        handle: 'spsg-plugin-ui',
    },
    '@storegrowth/components': {
        external: [ 'storegrowth', 'components' ],
        handle: 'spsg-components',
    },
    '@storegrowth/utilities': {
        external: [ 'storegrowth', 'utilities' ],
        handle: 'spsg-utilities',
    },
    '@storegrowth/hooks': {
        external: [ 'storegrowth', 'hooks' ],
        handle: 'spsg-hooks',
    },
};

/**
 * Dokan's shared scripts, for integration bundles on the Dokan vendor
 * dashboard (as dokan-lite's own mapping: `@dokan/components` is
 * `window.dokan.components`, handle `dokan-react-components`).
 *
 * @since SPSG_VERSION
 *
 * @type {Object.<string, {external: string[], handle: string}>}
 */
const DOKAN_EXTERNALS = {
    '@dokan/components': {
        external: [ 'dokan', 'components' ],
        handle: 'dokan-react-components',
    },
};

const EXTERNALS = { ...SHARED_EXTERNALS, ...DOKAN_EXTERNALS };

/**
 * Global for a request, or undefined to fall back to the WordPress defaults.
 *
 * Only the bare specifier is mapped; the shim in src/externals/ imports
 * plugin-ui by a relative path so it bundles the package instead of
 * re-exporting itself.
 *
 * @since SPSG_VERSION
 *
 * @param {string} request Import request.
 *
 * @return {string[]|undefined} External global path.
 */
const requestToExternal = ( request ) => {
    if ( EXTERNALS[ request ] ) {
        return EXTERNALS[ request ].external;
    }

    return undefined;
};

/**
 * Script handle for a request, or undefined to fall back to the defaults.
 *
 * @since SPSG_VERSION
 *
 * @param {string} request Import request.
 *
 * @return {string|undefined} Script handle.
 */
const requestToHandle = ( request ) => {
    if ( EXTERNALS[ request ] ) {
        return EXTERNALS[ request ].handle;
    }

    return undefined;
};

module.exports = {
    SHARED_EXTERNALS,
    DOKAN_EXTERNALS,
    requestToExternal,
    requestToHandle,
};
