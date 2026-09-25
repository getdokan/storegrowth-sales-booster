/**
 * Shared bundle for `@wedevs/plugin-ui`, exposed as `window.storegrowth.pluginUI`
 * (handle `spsg-plugin-ui`).
 *
 * Every other bundle imports the bare `@wedevs/plugin-ui` specifier, which
 * webpack-dependency-mapping.js maps to that global, so plugin-ui is downloaded
 * once. This file imports the package by a relative path on purpose: the bare
 * specifier is externalised, so using it here would make the bundle re-export
 * itself. Same approach as dokan-lite's src/externals/plugin-ui.js.
 *
 * @since SPSG_VERSION
 */
export * from '../../node_modules/@wedevs/plugin-ui/dist/index.js';
