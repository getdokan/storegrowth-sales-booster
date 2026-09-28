/**
 * Quick View admin bundle (`modules/quick-view/assets/js/admin.js`), loaded
 * on the StoreGrowth admin page before the app mounts. The app draws the
 * Quick View settings page (design `quick-view.html`) from the schema (PHP
 * `QuickViewSettings`: page, tabs, sections, fields) at
 * `#/settings?module=quick-view`; this adds the live preview (the modal over
 * the frame, a shop card with the Quick View button below it), the icon
 * picker and the Fly Cart switch, which shows only while Fly Cart is active.
 *
 * @since SPSG_VERSION
 */
import { useState } from '@wordpress/element';
import { addFilter } from '@wordpress/hooks';
import { __ } from '@wordpress/i18n';
import {
    IconPicker,
    LivePreview,
    type SettingsPageParts,
    SwitchField,
} from '@storegrowth/components';
import { type ModuleSettings, useModules } from '@storegrowth/hooks';
import { getHeaderData } from '@storegrowth/utilities';

import {
    QUICK_VIEW_ICONS,
    QuickViewModal,
    ShopCard,
} from './preview/quick-view-preview';
import type { QuickViewValues } from './types';

/**
 * The preview; the modal starts open and the shop card's button reopens it.
 *
 * @param props        Props.
 * @param props.values Current (unsaved) settings.
 */
function QuickViewPreview( { values }: { values: QuickViewValues } ) {
    const isPro = Boolean( getHeaderData().header_info.is_pro_exists );
    const [ modalOpen, setModalOpen ] = useState( true );

    return (
        <LivePreview
            // Phones: nothing when it's off there.
            overlay={ ( { device } ) => {
                return (
                    modalOpen &&
                    ( device !== 'mobile' || values.enable_in_mobile ) && (
                        <QuickViewModal
                            values={ values }
                            isPro={ isPro }
                            onClose={ () => {
                                setModalOpen( false );
                            } }
                        />
                    )
                );
            } }
            footer={ ( { device } ) => {
                return (
                    <div className="flex w-full flex-col items-center gap-2">
                        <ShopCard
                            values={ values }
                            isPro={ isPro }
                            onClick={ () => {
                                setModalOpen( true );
                            } }
                            hideButton={
                                device === 'mobile' && ! values.enable_in_mobile
                            }
                        />
                        <p className="text-center text-xs text-sg-help">
                            { __(
                                'The button on a shop card; click it to open the modal.',
                                'storegrowth-sales-booster'
                            ) }
                        </p>
                    </div>
                );
            } }
        />
    );
}

/**
 * Auto Open Fly Cart, only while the Fly Cart module is active (the schema's
 * `show_when` covers the Stay On Page redirect).
 *
 * @param props          Props.
 * @param props.settings The page's settings.
 */
function AutoOpenFlyCart( {
    settings,
}: {
    settings: ModuleSettings< QuickViewValues >;
} ) {
    const flyCartOn = Boolean( useModules().getModule( 'fly-cart' )?.status );

    if ( ! flyCartOn ) {
        return null;
    }

    return (
        <SwitchField
            label={ settings.schema.auto_open_fly_cart?.label ?? '' }
            checked={ settings.values.auto_open_fly_cart }
            onChange={ ( checked ) => {
                settings.setValue( 'auto_open_fly_cart', checked );
            } }
            locked={ settings.isLocked( 'auto_open_fly_cart' ) }
            error={ settings.errors.auto_open_fly_cart }
        />
    );
}

const quickViewPage: SettingsPageParts< QuickViewValues > = {
    preview: ( { values } ) => {
        return <QuickViewPreview values={ values } />;
    },

    controls: ( settings ) => {
        return {
            auto_open_fly_cart: <AutoOpenFlyCart settings={ settings } />,
            quick_view_icon: (
                <IconPicker
                    label={ settings.schema.quick_view_icon?.label ?? '' }
                    icons={ QUICK_VIEW_ICONS }
                    value={ settings.values.quick_view_icon }
                    onChange={ ( next ) => {
                        settings.setValue( 'quick_view_icon', next );
                    } }
                    clearable={ false }
                    locked={ settings.isLocked( 'quick_view_icon' ) }
                />
            ),
        };
    },
};

addFilter(
    'storegrowth.settings.page',
    'storegrowth/quick-view',
    ( parts: SettingsPageParts, moduleId: string ) => {
        if ( 'quick-view' !== moduleId ) {
            return parts;
        }

        return quickViewPage as SettingsPageParts;
    }
);
