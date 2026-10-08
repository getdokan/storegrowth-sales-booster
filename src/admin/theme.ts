/**
 * plugin-ui theme tokens for the StoreGrowth admin (design: storegrowth-design
 * `assets/theme.js`).
 *
 * @since SPSG_VERSION
 */
import { createTheme } from '@wedevs/plugin-ui';

/**
 * The tokens, for a page that changes a few (the Dokan vendor dashboard
 * follows Dokan's button colour, ADR-011).
 *
 * @since SPSG_VERSION
 */
export const storegrowthTokens = {
    primary: '#0875FF',
    primaryForeground: '#FFFFFF',
    ring: '#0875FF',
    foreground: '#25252D',
    cardForeground: '#25252D',
    popoverForeground: '#25252D',
    mutedForeground: '#828282',
    border: '#E9E9E9',
    input: '#E9E9E9',
    muted: '#F3F4F6',
    secondary: '#F3F4F6',
    secondaryForeground: '#25262B',
    accent: '#EFF6FF',
    accentForeground: '#0875FF',
    fontSans: '"Inter", ui-sans-serif, system-ui, sans-serif',
    radius: '8px',
};

export const storegrowthTheme = createTheme( storegrowthTokens );
