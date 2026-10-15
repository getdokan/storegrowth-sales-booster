/**
 * Dokan's shared components (`window.dokan.components`, handle
 * `dokan-react-components`), used by integration bundles on the Dokan vendor
 * dashboard. Only what those bundles use.
 *
 * @since 3.0.0
 */
declare module '@dokan/components' {
    import type { ComponentProps, ComponentType, ReactNode } from 'react';

    export const DokanButton: ComponentType<
        ComponentProps< 'button' > & {
            variant?: 'primary' | 'secondary' | 'tertiary';
            children?: ReactNode;
        }
    >;
}
