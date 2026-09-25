/**
 * Single webpack build for the admin UI (ADR-001).
 *
 * Extends @wordpress/scripts, as dokan-lite does. Core bundles go to `build/`,
 * module bundles to `build/modules/<id>/`, integration bundles to
 * `build/integrations/<bundle>/`.
 *
 * @since SPSG_VERSION
 */
const path = require( 'path' );
const TerserPlugin = require( 'terser-webpack-plugin' );
const defaultConfig = require( '@wordpress/scripts/config/webpack.config' );
const DependencyExtractionWebpackPlugin = require( '@wordpress/dependency-extraction-webpack-plugin' );
const entries = require( './webpack-entries' );
const {
    requestToExternal,
    requestToHandle,
} = require( './webpack-dependency-mapping' );

const isProduction = process.env.NODE_ENV === 'production';

module.exports = () => {
    const config = {
        ...defaultConfig,
        // Persistent cache (node_modules/.cache/webpack). One cache per mode so
        // `npm run start` and `npm run build` don't invalidate each other; it is
        // rebuilt only when these config files or package.json change.
        cache: {
            type: 'filesystem',
            name: `storegrowth-${
                isProduction ? 'production' : 'development'
            }`,
            buildDependencies: {
                config: [
                    __filename,
                    path.resolve( __dirname, 'webpack-entries.js' ),
                    path.resolve( __dirname, 'webpack-dependency-mapping.js' ),
                    path.resolve( __dirname, 'postcss.config.js' ),
                    path.resolve( __dirname, 'package.json' ),
                ],
            },
        },
        optimization: {
            ...defaultConfig.optimization,
            // Same Terser settings as @wordpress/scripts, but skip plugin-ui.js:
            // plugin-ui ships already minified, and re-minifying its 3.5 MB is
            // most of a cold production build.
            minimizer: [
                new TerserPlugin( {
                    parallel: true,
                    exclude: /(^|\/)plugin-ui\.js$/,
                    terserOptions: {
                        output: { comments: /translators:/i },
                        compress: { passes: 2 },
                        mangle: { reserved: [ '__', '_n', '_nx', '_x' ] },
                    },
                    extractComments: false,
                } ),
                ...( defaultConfig.optimization?.minimizer || [] ).filter(
                    ( minimizer ) =>
                        minimizer?.constructor?.name !== 'TerserPlugin'
                ),
            ],
        },
        entry: entries,
        output: {
            ...defaultConfig.output,
            path: path.resolve( __dirname, 'build' ),
            filename: '[name].js',
            clean: true,
            devtoolNamespace: 'storegrowth',
        },
        resolve: {
            ...defaultConfig.resolve,
            extensions: [ '.ts', '.tsx', '.js', '.jsx', '.json' ],
            alias: {
                ...( defaultConfig.resolve?.alias || {} ),
                '@src': path.resolve( __dirname, 'src' ),
            },
        },
        externals: {
            jquery: 'jQuery',
        },
        watchOptions: {
            ignored: [
                '**/node_modules/**',
                '**/build/**',
                '**/assets/**',
                '**/vendor/**',
                '**/lib/**',
            ],
        },
        plugins: [
            ...defaultConfig.plugins.filter(
                ( plugin ) =>
                    plugin.constructor.name !==
                    'DependencyExtractionWebpackPlugin'
            ),
            new DependencyExtractionWebpackPlugin( {
                requestToExternal,
                requestToHandle,
            } ),
        ],
    };

    if ( ! isProduction ) {
        config.devServer = {
            ...( defaultConfig.devServer || {} ),
            devMiddleware: { writeToDisk: true },
            allowedHosts: 'all',
            host: 'localhost',
            port: 8889,
        };
    }

    return config;
};
