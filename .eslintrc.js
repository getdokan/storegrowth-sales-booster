/**
 * ESLint config for the admin source (`src/`, `modules/*\/src/`, `integrations/src/`).
 *
 * Every directory and file name inside a `src/` directory is lowercase
 * kebab-case (ADR-003 §7a).
 */
module.exports = {
    root: true,
    extends: [ 'plugin:@wordpress/eslint-plugin/recommended' ],
    plugins: [ 'check-file' ],
    rules: {
        'check-file/filename-naming-convention': [
            'error',
            { '**/*.{ts,tsx,js,jsx,css}': 'KEBAB_CASE' },
            { ignoreMiddleExtensions: true },
        ],
        'check-file/folder-naming-convention': [
            'error',
            {
                'src/**/': 'KEBAB_CASE',
                'modules/*/src/**/': 'KEBAB_CASE',
                'integrations/src/**/': 'KEBAB_CASE',
            },
        ],
        // Bundled packages and `@storegrowth/*` externals are resolved by webpack.
        'import/no-unresolved': 'off',
        'import/no-extraneous-dependencies': 'off',
    },
};
