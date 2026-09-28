/**
 * BOGO on the Dokan vendor dashboard (`build/integrations/dokan/bogo.js`,
 * enqueued by PHP `Integrations\Dokan\Dashboard\Bogo`): the offer list and
 * editor the admin draws (`BogoList`, `BogoEditor`, vendor mode: the
 * vendor's own offers through `/bogo/offers/vendor`), on Dokan's routes
 * (`dokan-dashboard-routes`) at `#/bogo`, `#/bogo/create-bogo` and
 * `#/bogo/<id>`, with "Create New Offer" in Dokan's page header.
 *
 * Dokan's router draws the pages; each one bridges it to the shared router
 * (`Router`), so the pages' router hooks (`@storegrowth/hooks`) read Dokan's
 * location and navigate through Dokan (ADR-011). Styles: the shared
 * Tailwind stylesheet, scoped to `.spsg-layout` (ADR-003, ADR-011).
 *
 * @since SPSG_VERSION
 */
import { ThemeProvider, Toaster } from '@wedevs/plugin-ui';
import { Fill } from '@wordpress/components';
import { useMemo } from '@wordpress/element';
import { addFilter } from '@wordpress/hooks';
import { __ } from '@wordpress/i18n';
import type { ComponentType, ReactNode } from 'react';
import { DokanButton } from '@dokan/components';
import {
    type Location,
    type NavigateFunction,
    Navigate,
    type Navigator,
    Router,
    type To,
} from '@storegrowth/hooks';
import { storegrowthTheme } from '@src/admin/theme';

import BogoEditor from '../../../../modules/bogo/src/admin/editor/bogo-editor';
import BogoList from '../../../../modules/bogo/src/admin/list/bogo-list';

/** What Dokan's router gives a route's element (`withRouter`). */
interface DokanRouteProps {
    navigate: NavigateFunction;
    location: Location;
    params: Record< string, string | undefined >;
}

/** A Dokan dashboard route. */
interface DokanRoute {
    id: string;
    title: string;
    path: string;
    exact?: boolean;
    /** An element, or a component Dokan draws with the route props. */
    element: ReactNode | ComponentType< DokanRouteProps >;
    backUrl?: string;
}

/**
 * A path as a string.
 *
 * @param to Path.
 */
function toPath( to: To ): string {
    if ( typeof to === 'string' ) {
        return to;
    }

    return `${ to.pathname ?? '' }${ to.search ?? '' }${ to.hash ?? '' }`;
}

/**
 * One BOGO page on Dokan's route: the StoreGrowth theme (`.spsg-layout`),
 * toasts and the shared router, on Dokan's location and navigation.
 *
 * @param props          Props.
 * @param props.navigate Dokan's navigate.
 * @param props.location Dokan's location.
 * @param props.children The page.
 */
function VendorPage( {
    navigate,
    location,
    children,
}: Pick< DokanRouteProps, 'navigate' | 'location' > & {
    children: ReactNode;
} ) {
    const navigator = useMemo< Navigator >( () => {
        return {
            createHref: ( to ) => {
                return `#${ toPath( to ) }`;
            },
            go: ( delta ) => {
                navigate( delta );
            },
            push: ( to, state ) => {
                navigate( to, { state } );
            },
            replace: ( to, state ) => {
                navigate( to, { replace: true, state } );
            },
        };
    }, [ navigate ] );

    return (
        <ThemeProvider
            pluginId="storegrowth"
            className="spsg-layout"
            tokens={ storegrowthTheme }
            mode="light"
            storageKey={ false }
        >
            <Router location={ location } navigator={ navigator }>
                { children }
            </Router>
            <Toaster position="bottom-right" />
        </ThemeProvider>
    );
}

/**
 * The offer list, and "Create New Offer" in Dokan's page header.
 *
 * @param props Dokan's route props.
 */
function ListPage( props: DokanRouteProps ) {
    return (
        <>
            <Fill name="dokan-header-actions">
                <DokanButton
                    onClick={ () => {
                        props.navigate( '/bogo/create-bogo' );
                    } }
                >
                    { __( 'Create New Offer', 'storegrowth-sales-booster' ) }
                </DokanButton>
            </Fill>
            <VendorPage { ...props }>
                <BogoList vendor />
            </VendorPage>
        </>
    );
}

/**
 * A new offer.
 *
 * @param props Dokan's route props.
 */
function CreatePage( props: DokanRouteProps ) {
    return (
        <VendorPage { ...props }>
            <BogoEditor id={ null } vendor />
        </VendorPage>
    );
}

/**
 * An offer, by numeric id; anything else opens the list.
 *
 * @param props Dokan's route props.
 */
function EditPage( props: DokanRouteProps ) {
    const id = props.params?.bogo_id ?? '';

    return (
        <VendorPage { ...props }>
            { /^\d+$/.test( id ) ? (
                <BogoEditor id={ Number( id ) } vendor />
            ) : (
                <Navigate to="/bogo" replace />
            ) }
        </VendorPage>
    );
}

// Dokan fills in the route props (`withRouter`); the ids are 2.2.0's.
addFilter(
    'dokan-dashboard-routes',
    'storegrowth-dokan-vendor-bogo',
    ( routes: DokanRoute[] ) => {
        return [
            ...routes,
            {
                id: 'storegrowth-dokan-vendor-bogo',
                title: __( 'StoreGrowth BOGO', 'storegrowth-sales-booster' ),
                path: '/bogo',
                exact: true,
                element: ListPage,
            },
            {
                id: 'storegrowth-dokan-vendor-bogo-create',
                title: __(
                    'StoreGrowth BOGO Create',
                    'storegrowth-sales-booster'
                ),
                path: '/bogo/create-bogo',
                exact: true,
                element: CreatePage,
                backUrl: '/bogo',
            },
            {
                id: 'storegrowth-dokan-vendor-bogo-edit',
                title: __(
                    'StoreGrowth BOGO Edit',
                    'storegrowth-sales-booster'
                ),
                path: '/bogo/:bogo_id',
                exact: true,
                element: EditPage,
                backUrl: '/bogo',
            },
        ];
    }
);
