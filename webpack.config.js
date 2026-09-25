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
        cache: {
            type: 'filesystem',
            buildDependencies: {
                config: [ __filename ],
            },
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
