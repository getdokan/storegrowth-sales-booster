/**
 * Fly Cart admin bundle (`modules/fly-cart/assets/js/admin.js`), loaded on
 * the StoreGrowth admin page before the app mounts. The app draws the Fly
 * Cart settings page (design `fly-cart.html`) from the schema (PHP
 * `FlyCartSettings`: page, tabs, sections, fields) at
 * `#/settings?module=fly-cart`; this adds the preview of the cart panel and
 * its floating button, and the controls with art (layout, icon position,
 * icon).
 *
 * @since SPSG_VERSION
 */
import { cn } from '@wedevs/plugin-ui';
import { useState } from '@wordpress/element';
import { addFilter, applyFilters } from '@wordpress/hooks';
import { __ } from '@wordpress/i18n';
import type { ReactNode } from 'react';
import {
    IconPicker,
    LivePreview,
    type PickerCardOption,
    PickerCards,
    type SettingsPageParts,
} from '@storegrowth/components';
import type { ModuleSettings } from '@storegrowth/hooks';
import { getHeaderData } from '@storegrowth/utilities';

import { CART_ICONS, FlyCartPreview } from './preview/fly-cart-preview';
import type { FlyCartValues } from './types';

const isPro = () => {
    return Boolean( getHeaderData().header_info.is_pro_exists );
};

/**
 * Miniature of a storefront page (design `.pick-art`): four product tiles
 * and, on top, where the cart lands (`mark`).
 *
 * @param props      Props.
 * @param props.mark Classes placing the blue mark.
 */
function PickArt( { mark }: { mark: string } ) {
    const tile = 'rounded-[1px] bg-[#C9D8EE]';

    return (
        <span
            className="relative block h-[72px] rounded-md bg-[#EFF4FF]"
            aria-hidden
        >
            <span className="absolute inset-2.5 grid grid-cols-2 grid-rows-2 gap-x-[8%] gap-y-[12%]">
                <span className={ tile } />
                <span className={ tile } />
                <span className={ tile } />
                <span className={ tile } />
            </span>
            <span className={ cn( 'absolute bg-sg-brand', mark ) } />
        </span>
    );
}

const DOT = 'size-3.5 rounded-full';

/**
 * The preview, with the cart panel's open state (local UI state, the page's
 * render functions can't hold it).
 *
 * @param props        Props.
 * @param props.values Current (unsaved) settings.
 */
function FlyCartLivePreview( { values }: { values: FlyCartValues } ) {
    const [ cartOpen, setCartOpen ] = useState( true );

    return (
        <LivePreview
            minHeight={ 500 }
            overlay={ ( { device } ) => {
                /**
                 * Filters the Fly Cart preview, e.g. for pro or an
                 * integration to add its parts.
                 *
                 * @since SPSG_VERSION
                 *
                 * @param {JSX.Element}   preview The preview.
                 * @param {FlyCartValues} values  Current (unsaved) settings.
                 */
                return applyFilters(
                    'storegrowth.preview.fly-cart',
                    <FlyCartPreview
                        values={ values }
                        isPro={ isPro() }
                        device={ device }
                        open={ cartOpen }
                        onOpenChange={ setCartOpen }
                    />,
                    values
                ) as ReactNode;
            } }
        />
    );
}

const flyCartPage: SettingsPageParts< FlyCartValues > = {
    preview: ( { values } ) => {
        return <FlyCartLivePreview values={ values } />;
    },

    controls: ( settings: ModuleSettings< FlyCartValues > ) => {
        const { values, schema, setValue, isLocked } = settings;

        /**
         * A pro choice (`pro_options`) is locked without pro, unless it's
         * the current value (a stored pro choice still shows as chosen).
         *
         * @param key   Setting key.
         * @param value Choice.
         */
        const proLocked = (
            key: 'layout' | 'icon_position',
            value: string
        ) => {
            return (
                ! isPro() &&
                Boolean( schema[ key ]?.pro_options?.includes( value ) ) &&
                value !== values[ key ]
            );
        };

        const option = (
            key: 'layout' | 'icon_position',
            value: string,
            label: string,
            mark: string
        ): PickerCardOption => {
            return {
                value,
                label,
                art: <PickArt mark={ mark } />,
                locked: proLocked( key, value ),
            };
        };

        const layouts = [
            option(
                'layout',
                'side',
                __( 'Side Cart', 'storegrowth-sales-booster' ),
                'bottom-2.5 right-2.5 top-2.5 w-[34%] rounded opacity-85'
            ),
            option(
                'layout',
                'center',
                __( 'Centered Popup', 'storegrowth-sales-booster' ),
                'left-1/2 top-1/2 h-[46%] w-[56%] -translate-x-1/2 -translate-y-1/2 rounded opacity-85'
            ),
        ];

        const positions = [
            option(
                'icon_position',
                'bottom-right',
                __( 'Bottom Right', 'storegrowth-sales-booster' ),
                `${ DOT } bottom-1.5 right-1.5`
            ),
            option(
                'icon_position',
                'top-right',
                __( 'Top Right', 'storegrowth-sales-booster' ),
                `${ DOT } right-1.5 top-1.5`
            ),
            option(
                'icon_position',
                'center-right',
                __( 'Centre Right', 'storegrowth-sales-booster' ),
                `${ DOT } right-1.5 top-1/2 -mt-[7px]`
            ),
            option(
                'icon_position',
                'top-left',
                __( 'Top Left', 'storegrowth-sales-booster' ),
                `${ DOT } left-1.5 top-1.5`
            ),
            option(
                'icon_position',
                'bottom-left',
                __( 'Bottom Left', 'storegrowth-sales-booster' ),
                `${ DOT } bottom-1.5 left-1.5`
            ),
            option(
                'icon_position',
                'center-left',
                __( 'Centre Left', 'storegrowth-sales-booster' ),
                `${ DOT } left-1.5 top-1/2 -mt-[7px]`
            ),
        ];

        return {
            layout: (
                <PickerCards
                    label={ schema.layout?.label ?? '' }
                    options={ layouts }
                    value={ values.layout }
                    onChange={ ( next ) => {
                        setValue( 'layout', next as FlyCartValues[ 'layout' ] );
                    } }
                    locked={ isLocked( 'layout' ) }
                />
            ),
            icon_position: (
                <PickerCards
                    label={ schema.icon_position?.label ?? '' }
                    options={ positions }
                    columns={ 3 }
                    value={ values.icon_position }
                    onChange={ ( next ) => {
                        setValue(
                            'icon_position',
                            next as FlyCartValues[ 'icon_position' ]
                        );
                    } }
                    locked={ isLocked( 'icon_position' ) }
                />
            ),
            icon_name: (
                <IconPicker
                    label={ schema.icon_name?.label ?? '' }
                    icons={ CART_ICONS }
                    value={ values.icon_name }
                    onChange={ ( next ) => {
                        setValue( 'icon_name', next );
                    } }
                    clearable={ false }
                    hideLabel
                    locked={ isLocked( 'icon_name' ) }
                />
            ),
        };
    },
};

addFilter(
    'storegrowth.settings.page',
    'storegrowth/fly-cart',
    ( parts: SettingsPageParts, moduleId: string ) => {
        if ( 'fly-cart' !== moduleId ) {
            return parts;
        }

        return flyCartPage as SettingsPageParts;
    }
);
