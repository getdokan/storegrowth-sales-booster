/**
 * Global settings. Not in the mockups; built from the same components as the
 * designed pages. Uses the existing `sales-booster/v1/settings` route.
 *
 * @since SPSG_VERSION
 */
import { toast } from '@wedevs/plugin-ui';
import apiFetch from '@wordpress/api-fetch';
import { useEffect, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { CardHead, ToggleSwitch } from '@storegrowth/components';
import { errorMessage, getAdminData } from '@storegrowth/utilities';

interface GlobalSettings {
    remove_data_on_uninstall: boolean;
}

export default function SettingsPage() {
    const path = `/${ getAdminData().restNamespace }/settings`;
    const [ settings, setSettings ] = useState< GlobalSettings | null >( null );
    const [ saving, setSaving ] = useState( false );

    useEffect( () => {
        apiFetch< GlobalSettings >( { path } )
            .then( setSettings )
            .catch( ( error ) =>
                toast.error(
                    errorMessage(
                        error,
                        __(
                            'Settings could not be loaded.',
                            'storegrowth-sales-booster'
                        )
                    )
                )
            );
    }, [ path ] );

    const update = async ( value: boolean ) => {
        setSaving( true );

        try {
            setSettings(
                await apiFetch< GlobalSettings >( {
                    path,
                    method: 'POST',
                    data: { remove_data_on_uninstall: value },
                } )
            );
            toast.success(
                __( 'Settings saved.', 'storegrowth-sales-booster' )
            );
        } catch ( error ) {
            toast.error(
                errorMessage(
                    error,
                    __(
                        'Settings could not be saved.',
                        'storegrowth-sales-booster'
                    )
                )
            );
        } finally {
            setSaving( false );
        }
    };

    return (
        <div className="flex w-full flex-col items-center px-4 pb-12 pt-12 sm:px-8">
            <div className="flex w-full max-w-[1280px] flex-col items-start gap-6">
                <CardHead
                    title={ __( 'Settings', 'storegrowth-sales-booster' ) }
                />
                <div className="flex w-full items-start justify-between gap-6 rounded-[8px] border border-sg-cardline bg-white p-6">
                    <div className="flex min-w-0 flex-col gap-1">
                        <h2 className="text-[16px] font-bold leading-6 text-sg-heading">
                            { __(
                                'Remove data on uninstall',
                                'storegrowth-sales-booster'
                            ) }
                        </h2>
                        <p className="text-[12px] leading-[1.4] text-sg-help">
                            { __(
                                'Delete every StoreGrowth setting, offer and table when the plugin is deleted. This cannot be undone.',
                                'storegrowth-sales-booster'
                            ) }
                        </p>
                    </div>
                    <ToggleSwitch
                        className="mt-0.5"
                        checked={ Boolean(
                            settings?.remove_data_on_uninstall
                        ) }
                        disabled={ ! settings || saving }
                        onCheckedChange={ update }
                        aria-label={ __(
                            'Remove data on uninstall',
                            'storegrowth-sales-booster'
                        ) }
                    />
                </div>
            </div>
        </div>
    );
}
