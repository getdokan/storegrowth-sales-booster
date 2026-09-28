/**
 * BOGO admin bundle (`modules/bogo/assets/js/admin.js`), loaded on the
 * StoreGrowth admin page before the app mounts. The app draws the BOGO
 * settings page from the schema (PHP `BogoSettings`) at
 * `#/settings?module=bogo`; this adds the badge picker (image badges and
 * the custom upload, two keys).
 *
 * @since SPSG_VERSION
 */
import { addFilter } from '@wordpress/hooks';
import { __ } from '@wordpress/i18n';
import type { ReactNode } from 'react';
import {
    CardHead,
    FeatureLayout,
    IconPicker,
    type SettingsPageParts,
} from '@storegrowth/components';
import { Link } from '@storegrowth/hooks';
import type { SettingValue } from '@storegrowth/utilities';

import { BOGO_BADGES } from './badges';
import BogoList from './list/bogo-list';

interface BogoSettingsValues extends Record< string, SettingValue > {
    default_badge_icon_name: string;
    default_custom_badge_icon: string;
}

const bogoSettingsPage: SettingsPageParts< BogoSettingsValues > = {
    controls: ( { values, schema, setValues, isLocked, errors } ) => {
        // The storefront shows an uploaded badge over the chosen icon, with
        // pro only (locked here without pro: it shows the icon).
        const locked = isLocked( 'default_badge_icon_name' );
        const custom = locked ? '' : values.default_custom_badge_icon;

        return {
            default_badge_icon_name: (
                <IconPicker
                    label={ schema.default_badge_icon_name?.label ?? '' }
                    icons={ BOGO_BADGES }
                    iconSize="lg"
                    value={ custom ? '' : values.default_badge_icon_name }
                    clearable={ false }
                    // An icon replaces the upload; an upload keeps the
                    // stored icon (the picker would clear it).
                    onChange={ ( next ) => {
                        if ( next ) {
                            setValues( {
                                default_badge_icon_name: next,
                                default_custom_badge_icon: '',
                            } );
                        }
                    } }
                    custom={ custom }
                    onCustomChange={ ( url ) => {
                        setValues( { default_custom_badge_icon: url } );
                    } }
                    locked={ locked }
                    error={ errors.default_custom_badge_icon }
                />
            ),
        };
    },
};

/**
 * The offer editor's place until it's built (step 10d).
 *
 * @since SPSG_VERSION
 */
function EditorComing() {
    return (
        <FeatureLayout moduleId="bogo">
            <CardHead title={ __( 'BOGO', 'storegrowth-sales-booster' ) } />
            <div className="w-full rounded-lg border border-sg-cardline bg-white p-6 text-sm text-sg-muted">
                { __(
                    'The offer editor is on its way.',
                    'storegrowth-sales-booster'
                ) }{ ' ' }
                <Link to="/bogo" className="text-sg-brand underline">
                    { __( 'Back to BOGO offers', 'storegrowth-sales-booster' ) }
                </Link>
            </div>
        </FeatureLayout>
    );
}

interface AdminRoute {
    id: string;
    path: string;
    element: ReactNode;
}

// The module's pages; the paths are 2.2.0's, so old links keep working.
addFilter(
    'storegrowth.admin.routes',
    'storegrowth/bogo',
    ( routes: AdminRoute[] ) => [
        ...routes,
        { id: 'bogo', path: '/bogo', element: <BogoList /> },
        {
            id: 'bogo-create',
            path: '/bogo/create-bogo',
            element: <EditorComing />,
        },
        { id: 'bogo-edit', path: '/bogo/:id', element: <EditorComing /> },
    ]
);

addFilter(
    'storegrowth.settings.page',
    'storegrowth/bogo',
    ( parts: SettingsPageParts, moduleId: string ) => {
        if ( 'bogo' !== moduleId ) {
            return parts;
        }

        return bogoSettingsPage as SettingsPageParts;
    }
);
