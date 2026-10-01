/**
 * ESLint config for the admin source (`src/`, `modules/*\/src/`, `integrations/src/`).
 *
 * Every directory and file name inside a `src/` directory is lowercase
 * kebab-case (ADR-002 §7a).
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
        // One router instance for the shell, modules and pro: use the re-export.
        'no-restricted-imports': [
            'error',
            {
                paths: [
                    {
                        name: 'react-router-dom',
                        message:
                            'Import router APIs from @storegrowth/hooks so every bundle shares the shell’s router.',
                    },
                    {
                        name: 'react-router',
                        message:
                            'Import router APIs from @storegrowth/hooks so every bundle shares the shell’s router.',
                    },
                ],
            },
        ],
    },
    overrides: [
        {
            // The one place allowed to import react-router-dom.
            files: [ 'src/hooks/router.ts' ],
            rules: { 'no-restricted-imports': 'off' },
        },
    ],
};
