/**
 * BOGO admin bundle (`modules/bogo/assets/js/admin.js`), loaded on the
 * StoreGrowth admin page before the app mounts. The app draws the BOGO
 * settings page from the schema (PHP `BogoSettings`) at
 * `#/settings?module=bogo`; this adds its badge picker (image badges and
 * the custom upload, two keys), and the module's own pages: the offer list
 * (`#/bogo`) and the offer editor (`#/bogo/create-bogo`, `#/bogo/<id>`).
 *
 * @since SPSG_VERSION
 */
import { addFilter } from '@wordpress/hooks';
import type { ReactNode } from 'react';
import { IconPicker, type SettingsPageParts } from '@storegrowth/components';
import { Navigate, useParams } from '@storegrowth/hooks';
import type { SettingValue } from '@storegrowth/utilities';

import { BOGO_BADGES } from './badges';
import BogoEditor from './editor/bogo-editor';
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
 * `/bogo/:id` opens the editor for a numeric id only. Anything else (2.2.0's
 * `/bogo/create-message`, until the category messages have a page) opens
 * the list.
 *
 * @since SPSG_VERSION
 */
function EditRoute() {
    const { id = '' } = useParams();

    if ( ! /^\d+$/.test( id ) ) {
        return <Navigate to="/bogo" replace />;
    }

    return <BogoEditor id={ Number( id ) } />;
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
            element: <BogoEditor id={ null } />,
        },
        { id: 'bogo-edit', path: '/bogo/:id', element: <EditRoute /> },
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
