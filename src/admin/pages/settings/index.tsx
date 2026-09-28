/**
 * Settings pages, built from what the backend defines (PHP `SettingsPage`):
 * `#/settings?module=<id>&tab=<tab>`. Without a module it opens the global
 * settings (`general`). A module page sits in the feature frame (module
 * rail); the global page in the plain page frame. This is every module's
 * page: one without settings yet (BOGO, …) shows the empty frame.
 *
 * Every page comes from one request (`sales-booster/v1/admin/settings`). A
 * module adds its live preview and page-drawn controls through the
 * `storegrowth.settings.page` JS filter.
 *
 * @since SPSG_VERSION
 */
import { applyFilters } from '@wordpress/hooks';
import type { ReactNode } from 'react';
import {
    CardHead,
    FeatureLayout,
    ModuleSettingsPage,
    type SettingsPageParts,
} from '@storegrowth/components';
import {
    Navigate,
    useModules,
    useModuleSettings,
    useSearchParams,
    useSettingsPages,
} from '@storegrowth/hooks';
import { moduleLabel } from '@storegrowth/utilities';

/** Page opened by `#/settings` without a module. */
const GENERAL = 'general';

export default function SettingsPage() {
    const [ searchParams ] = useSearchParams();
    const id = searchParams.get( 'module' ) || GENERAL;
    const { pages, loading } = useSettingsPages();
    const module = useModules().getModule( id );
    const title = module ? moduleLabel( module ) : '';
    const hasPage = GENERAL === id || Boolean( pages[ id ] );

    // Neither a page nor a module (an old or mistyped link): global settings.
    if ( ! loading && ! hasPage && ! module ) {
        return <Navigate to="/settings" replace />;
    }

    // A module without a page yet shows its empty frame (rail + title).
    const page = hasPage ? (
        // Keyed: another page starts with fresh settings state.
        <PageContent key={ id } id={ id } title={ title } />
    ) : (
        <CardHead title={ title } />
    );

    return module ? (
        <FeatureLayout moduleId={ id }>{ page }</FeatureLayout>
    ) : (
        <div className="spsg-page flex w-full flex-col items-center px-4 pb-12 pt-12 sm:px-8">
            <div className="flex w-full max-w-[1280px] flex-col items-start gap-6">
                { page }
            </div>
        </div>
    );
}

/**
 * @param props       Props.
 * @param props.id    Page id.
 * @param props.title Title while loading.
 */
function PageContent( { id, title }: { id: string; title: string } ) {
    const settings = useModuleSettings( id );
    const loaded = ! settings.loading && ! settings.loadError;

    /**
     * Filters what a module adds to its settings page: `preview` and
     * `controls`, render functions of the page's settings.
     *
     * @since SPSG_VERSION
     *
     * @param {SettingsPageParts} parts    Preview and controls (none by default).
     * @param {string}            moduleId Page id (module id, or `general`).
     */
    const parts = applyFilters(
        'storegrowth.settings.page',
        {},
        id
    ) as SettingsPageParts;

    // Parts render once the settings are there (they read the values).
    return (
        <ModuleSettingsPage
            title={ title }
            settings={ settings }
            preview={
                loaded ? ( parts.preview?.( settings ) as ReactNode ) : null
            }
            controls={ loaded ? parts.controls?.( settings ) : undefined }
        />
    );
}
