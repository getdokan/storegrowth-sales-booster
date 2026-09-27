/**
 * Quick View preview (design `.qv-stage` / `.qv-modal`): a shop card with the
 * Quick View button where Button Position puts it, and the modal over the
 * frame with the chosen contents and colours.
 *
 * Unlike the other modules this preview doesn't render the storefront's
 * markup: the real modal is the theme's single-product layout (a 920px
 * two-column popup styled by the theme and magnific-popup), which neither
 * fits the frame nor looks like any one store. It follows the design's mock
 * instead (spec §9).
 *
 * @since SPSG_VERSION
 */
import { Button, cn } from '@wedevs/plugin-ui';
import { __ } from '@wordpress/i18n';
import {
    ChevronLeft,
    ChevronRight,
    Eye,
    ScanEye,
    Search,
    X,
    ZoomIn,
    type LucideIcon,
} from 'lucide-react';
import { assetUrl } from '@storegrowth/utilities';

import type { QuickViewValues } from '../types';

/** Stored icon value → icon, in the design's order. */
export const QUICK_VIEW_ICONS: Array< {
    value: string;
    label: string;
    Icon: LucideIcon;
} > = [
    {
        value: 'quick-view-icon-1',
        label: __( 'Zoom in', 'storegrowth-sales-booster' ),
        Icon: ZoomIn,
    },
    {
        value: 'quick-view-icon-2',
        label: __( 'Eye', 'storegrowth-sales-booster' ),
        Icon: Eye,
    },
    {
        value: 'quick-view-icon-3',
        label: __( 'Scan', 'storegrowth-sales-booster' ),
        Icon: ScanEye,
    },
    {
        value: 'quick-view-icon-4',
        label: __( 'Search', 'storegrowth-sales-booster' ),
        Icon: Search,
    },
];

export interface QuickViewButtonProps {
    values: QuickViewValues;
    /** Pro is active (icon mode and image positions need it). */
    isPro: boolean;
    onClick: () => void;
}

/**
 * The Quick View button as the shop loop shows it.
 *
 * @since SPSG_VERSION
 *
 * @param props         Props.
 * @param props.values  Settings.
 * @param props.isPro   Pro active.
 * @param props.onClick Opens the modal.
 */
export function QuickViewButton( {
    values,
    isPro,
    onClick,
}: QuickViewButtonProps ) {
    const icon =
        isPro && values.enable_qucik_view_icon
            ? QUICK_VIEW_ICONS.find(
                  ( item ) => item.value === values.quick_view_icon
              ) ?? QUICK_VIEW_ICONS[ 0 ]
            : undefined;

    return (
        <Button
            onClick={ onClick }
            aria-label={
                icon
                    ? values.button_label ||
                      __( 'Quick View', 'storegrowth-sales-booster' )
                    : undefined
            }
            className={ cn(
                'h-auto gap-1.5 border-0 text-[12px] font-semibold leading-none hover:opacity-90',
                icon ? 'p-2' : 'px-3.5 py-[7px]'
            ) }
            style={ {
                borderRadius: values.button_border_radius,
                background: values.button_color,
                color: values.button_text_color,
            } }
        >
            { icon ? (
                <icon.Icon className="size-4" aria-hidden />
            ) : (
                values.button_label
            ) }
        </Button>
    );
}

/**
 * A shop-loop card with the button where Button Position puts it.
 *
 * @since SPSG_VERSION
 *
 * @param props            Props.
 * @param props.values     Settings.
 * @param props.isPro      Pro active.
 * @param props.onClick    Opens the modal.
 * @param props.hideButton No button (phones with Enable In Mobile off).
 */
export function ShopCard( {
    values,
    isPro,
    onClick,
    hideButton = false,
}: QuickViewButtonProps & { hideButton?: boolean } ) {
    const onImage =
        isPro &&
        [ 'center_on_the_image', 'top_right_of_the_image' ].includes(
            values.button_position
        );
    const button = hideButton ? null : (
        <QuickViewButton
            values={ values }
            isPro={ isPro }
            onClick={ onClick }
        />
    );
    const addToCart = (
        <span className="inline-flex items-center justify-center rounded-[4px] bg-[#E1E2E4] px-3.5 py-[7px] text-[12px] font-semibold text-[#111]">
            { __( 'Add to cart', 'storegrowth-sales-booster' ) }
        </span>
    );

    return (
        <div className="flex w-[220px] flex-col gap-2 rounded-lg bg-white p-3 shadow-[0_1px_3px_rgba(0,0,0,.08)]">
            <div className="relative h-[140px] overflow-hidden rounded bg-[#F2F2F5]">
                <img
                    src={ assetUrl( 'images/preview/product.jpeg' ) }
                    alt=""
                    className="block h-full w-full object-cover"
                />
                { onImage && button && (
                    <span
                        className={ cn(
                            'absolute z-[2] shadow-[0_2px_8px_rgba(0,0,0,.25)]',
                            values.button_position === 'center_on_the_image'
                                ? 'left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2'
                                : 'right-2.5 top-2.5'
                        ) }
                    >
                        { button }
                    </span>
                ) }
            </div>
            <p className="text-[13px] font-semibold text-[#111]">
                { __( 'Your Product Name', 'storegrowth-sales-booster' ) }
            </p>
            <p className="text-[12px] text-[#374151]">$49</p>
            <div className="flex flex-wrap items-center gap-2">
                { ! onImage &&
                    values.button_position === 'before_add_to_cart' &&
                    button }
                { addToCart }
                { ! onImage &&
                    values.button_position !== 'before_add_to_cart' &&
                    button }
            </div>
        </div>
    );
}

export interface QuickViewModalProps {
    values: QuickViewValues;
    isPro: boolean;
    onClose: () => void;
}

/**
 * The modal over the frame (design `.qv-stage`).
 *
 * @since SPSG_VERSION
 *
 * @param props         Props.
 * @param props.values  Settings.
 * @param props.isPro   Pro active.
 * @param props.onClose Closes it.
 */
export function QuickViewModal( {
    values,
    isPro,
    onClose,
}: QuickViewModalProps ) {
    const arrow =
        'absolute top-1/2 z-[2] inline-flex size-7 -translate-y-1/2 items-center justify-center text-white';

    return (
        // The arrows sit outside the modal, as on the storefront.
        <div
            className={ cn(
                '@container absolute inset-0 top-[20.462px] z-[3] flex items-center justify-center p-4',
                isPro && 'px-9'
            ) }
        >
            <div className="absolute inset-0 bg-black/20" aria-hidden />
            { isPro && (
                <>
                    <span
                        className={ cn( arrow, 'left-1' ) }
                        style={ { background: values.navigation_background } }
                        aria-hidden
                    >
                        <ChevronLeft className="size-4" />
                    </span>
                    <span
                        className={ cn( arrow, 'right-1' ) }
                        style={ { background: values.navigation_background } }
                        aria-hidden
                    >
                        <ChevronRight className="size-4" />
                    </span>
                </>
            ) }
            <div
                className={ cn(
                    'relative z-[1] grid max-h-full w-full max-w-[560px] overflow-auto rounded-lg shadow-[0_12px_32px_rgba(0,0,0,.22)]',
                    values.show_image
                        ? 'grid-cols-[minmax(0,245px)_minmax(0,1fr)] @max-[420px]:grid-cols-1'
                        : 'grid-cols-1'
                ) }
                style={ { background: values.modal_background_color } }
            >
                { values.enable_close_button && (
                    <Button
                        variant="ghost"
                        onClick={ onClose }
                        aria-label={ __(
                            'Close quick view',
                            'storegrowth-sales-booster'
                        ) }
                        className="absolute right-3 top-3 z-[2] size-auto p-0.5 text-[#111] hover:bg-transparent"
                    >
                        <X className="size-4" strokeWidth={ 2 } aria-hidden />
                    </Button>
                ) }
                { values.show_image && (
                    <div className="relative row-span-2 min-h-[140px] overflow-hidden bg-[#F2F2F5] @max-[420px]:row-span-1">
                        <img
                            src={ assetUrl( 'images/preview/product.jpeg' ) }
                            alt=""
                            className="absolute inset-0 h-full w-full object-cover"
                        />
                    </div>
                ) }
                <div className="flex flex-col gap-2 px-[18px] pb-3 pt-4">
                    { values.show_title && (
                        <h3 className="m-0 text-base font-bold text-[#111]">
                            { __(
                                'Your Product Name',
                                'storegrowth-sales-booster'
                            ) }
                        </h3>
                    ) }
                    { values.show_excerpt && (
                        <p className="m-0 text-[11px] text-[#25252D]">
                            { __(
                                'A short summary of the product.',
                                'storegrowth-sales-booster'
                            ) }
                        </p>
                    ) }
                    { values.show_price && (
                        <p className="m-0 flex items-baseline gap-1.5 text-[11px]">
                            <s className="text-[#9CA3AF]">$59</s>
                            <span className="font-semibold text-[#374151]">
                                $49
                            </span>
                        </p>
                    ) }
                    { values.show_add_to_cart && (
                        <div className="flex items-center gap-2.5">
                            <span className="inline-flex h-7 w-10 items-center justify-center rounded-md border border-[#E4E4E7] bg-white text-[11px]">
                                1
                            </span>
                            <span className="inline-flex items-center rounded bg-[#0875FF] px-3 py-1.5 text-[12px] font-medium text-white">
                                { __(
                                    'Add to cart',
                                    'storegrowth-sales-booster'
                                ) }
                            </span>
                        </div>
                    ) }
                    { values.show_meta && (
                        <p className="m-0 text-[11px] text-[#25252D]">
                            { __(
                                'SKU: 1024 · Category: Shoes',
                                'storegrowth-sales-booster'
                            ) }
                        </p>
                    ) }
                    { values.show_description && (
                        <div>
                            <h4 className="m-0 mt-1 text-sm font-bold text-[#111]">
                                { __(
                                    'Description',
                                    'storegrowth-sales-booster'
                                ) }
                            </h4>
                            <p className="m-0 text-[11px] leading-[1.5] text-[#25252D]">
                                { __(
                                    'The full product description shows here.',
                                    'storegrowth-sales-booster'
                                ) }
                            </p>
                        </div>
                    ) }
                </div>
                { isPro && values.show_view_details_button && (
                    <span
                        className={ cn(
                            'sticky bottom-0 block bg-[#222] p-[7px] text-center text-[11px] font-semibold text-white',
                            values.show_image &&
                                'col-start-2 @max-[420px]:col-start-1'
                        ) }
                    >
                        { __(
                            'View Product Details',
                            'storegrowth-sales-booster'
                        ) }
                    </span>
                ) }
            </div>
        </div>
    );
}
