/**
 * Fly Cart preview (design `.cart-stage`): the cart panel over the page, as a
 * side cart or a centered popup, and the floating cart button in its corner.
 *
 * A mock like Quick View's (spec §9): the storefront cart is the theme's
 * WooCommerce markup inside the panel, which doesn't fit the frame.
 *
 * @since SPSG_VERSION
 */
import { Button, cn } from '@wedevs/plugin-ui';
import { __, sprintf } from '@wordpress/i18n';
import {
    Briefcase,
    Package,
    ShoppingBag,
    ShoppingBasket,
    ShoppingCart,
    Trash2,
    X,
    type LucideIcon,
} from 'lucide-react';
import type { CSSProperties } from 'react';
import type { PreviewDevice } from '@storegrowth/components';
import { assetUrl } from '@storegrowth/utilities';

import type { FlyCartValues } from '../types';

/**
 * Stored icon value → icon, in the design's order. `-5` (the default) was a
 * bag and stays one; the storefront template draws the same icons.
 */
export const CART_ICONS: Array< {
    value: string;
    label: string;
    Icon: LucideIcon;
} > = [
    {
        value: 'shopping-cart-icon-1',
        label: __( 'Shopping cart', 'storegrowth-sales-booster' ),
        Icon: ShoppingCart,
    },
    {
        value: 'shopping-cart-icon-2',
        label: __( 'Shopping basket', 'storegrowth-sales-booster' ),
        Icon: ShoppingBasket,
    },
    {
        value: 'shopping-cart-icon-5',
        label: __( 'Shopping bag', 'storegrowth-sales-booster' ),
        Icon: ShoppingBag,
    },
    {
        value: 'shopping-cart-icon-3',
        label: __( 'Package', 'storegrowth-sales-booster' ),
        Icon: Package,
    },
    {
        value: 'shopping-cart-icon-4',
        label: __( 'Briefcase', 'storegrowth-sales-booster' ),
        Icon: Briefcase,
    },
];

/** Where the floating button sits, per `icon_position`. */
const FAB_POSITION: Record< FlyCartValues[ 'icon_position' ], string > = {
    'bottom-right': 'right-3.5 bottom-3.5',
    'top-right': 'right-3.5 top-3.5',
    'center-right': 'right-3.5 top-1/2 -translate-y-1/2',
    'top-left': 'left-3.5 top-3.5',
    'bottom-left': 'left-3.5 bottom-3.5',
    'center-left': 'left-3.5 top-1/2 -translate-y-1/2',
};

interface CartLineProps {
    values: FlyCartValues;
    isPro: boolean;
    /** The BOGO free item. */
    free?: boolean;
    mobile: boolean;
}

/**
 * One item in the cart (design `.cart-line`).
 *
 * @since SPSG_VERSION
 *
 * @param props        Props.
 * @param props.values Settings.
 * @param props.isPro  Pro active.
 * @param props.free   The BOGO free item.
 * @param props.mobile Phone preview.
 */
function CartLine( { values, isPro, free = false, mobile }: CartLineProps ) {
    // The storefront prints the price inside the quantity block.
    const showPrice = values.show_quantity_picker && values.show_product_price;
    const hasRight = showPrice || values.show_remove_icon;

    return (
        <div
            className={ cn(
                'flex items-start gap-2.5 rounded-[10px] border border-[#E4E4E7] p-2.5',
                mobile && 'flex-wrap'
            ) }
            style={ { background: values.product_card_bg_color } }
        >
            { values.show_product_image && (
                <span
                    className={ cn(
                        'relative shrink-0 overflow-hidden rounded-[7px] bg-[#E8F0EA]',
                        mobile ? 'size-10' : 'size-[46px]'
                    ) }
                >
                    <img
                        src={ assetUrl( 'images/preview/product.jpeg' ) }
                        alt=""
                        className="block size-full object-cover"
                    />
                    { free && isPro && values.fly_cart_badge_icon && (
                        <span className="absolute left-0 top-0 rounded-br-md bg-[#EF4444] px-[3px] py-0.5 text-[8px] font-extrabold text-white">
                            { __( 'FREE', 'storegrowth-sales-booster' ) }
                        </span>
                    ) }
                </span>
            ) }
            <span
                className={ cn(
                    'flex min-w-0 flex-auto flex-col gap-2.5',
                    mobile && 'basis-[calc(100%-50px)]'
                ) }
            >
                <span className="text-[11px] font-semibold text-[#141414]">
                    { __( 'Hoodie with Zipper', 'storegrowth-sales-booster' ) }
                </span>
                { values.show_quantity_picker && (
                    <span className="inline-flex h-[23px] w-max items-center overflow-hidden rounded-[5px] border border-[#E4E4E7] text-[11px] text-[#141414]">
                        <span className="flex size-[23px] items-center justify-center">
                            -
                        </span>
                        <b className="flex size-[23px] items-center justify-center border-x border-[#E4E4E7] font-semibold">
                            1
                        </b>
                        <span className="flex size-[23px] items-center justify-center">
                            +
                        </span>
                    </span>
                ) }
                { ! free && isPro && values.show_stock_status && (
                    <span className="text-[9px] font-medium text-[#E11D48]">
                        { __( 'Available: 10', 'storegrowth-sales-booster' ) }
                    </span>
                ) }
            </span>
            { hasRight && (
                <span
                    className={ cn(
                        'flex shrink-0 flex-col items-end justify-between gap-2 self-stretch',
                        mobile &&
                            'flex-[1_1_100%] flex-row items-center border-t border-[#F0F0F0] pt-2'
                    ) }
                >
                    { showPrice && (
                        <span className="flex items-center gap-1.5 text-[11px] font-bold text-[#141414]">
                            { free ? (
                                <>
                                    <s className="text-[9px] font-normal text-[#71717A]">
                                        $42.00
                                    </s>
                                    $0.00
                                </>
                            ) : (
                                '$42.00'
                            ) }
                        </span>
                    ) }
                    { values.show_remove_icon && (
                        <Trash2
                            className="size-4 text-[#71717A]"
                            strokeWidth={ 1.5 }
                            aria-hidden
                        />
                    ) }
                </span>
            ) }
        </div>
    );
}

export interface FlyCartPreviewProps {
    values: FlyCartValues;
    isPro: boolean;
    device: PreviewDevice;
    /** The panel is open (the button opens it again). */
    open: boolean;
    onOpenChange: ( open: boolean ) => void;
}

/**
 * The cart over the frame (design `.cart-stage`).
 *
 * @since SPSG_VERSION
 *
 * @param props              Props.
 * @param props.values       Settings.
 * @param props.isPro        Pro active.
 * @param props.device       Preview device.
 * @param props.open         Panel open.
 * @param props.onOpenChange Opens or closes the panel.
 */
export function FlyCartPreview( {
    values,
    isPro,
    device,
    open,
    onOpenChange,
}: FlyCartPreviewProps ) {
    const mobile = device === 'mobile';
    const popup = isPro && values.layout === 'center';
    const icon =
        CART_ICONS.find( ( item ) => item.value === values.icon_name ) ??
        CART_ICONS.find( ( item ) => item.value === 'shopping-cart-icon-5' )!;
    const position =
        FAB_POSITION[ values.icon_position ] ?? FAB_POSITION[ 'bottom-right' ];
    const button: CSSProperties = { background: values.buttons_bg_color };

    return (
        <div className="absolute inset-0 top-[20.462px] z-[3]">
            { open && (
                <>
                    <div
                        className="absolute inset-0 z-[1] bg-black/20"
                        aria-hidden
                    />
                    <section
                        className={ cn(
                            'absolute z-[2] flex flex-col overflow-auto border border-[#E4E4E7] text-xs shadow-[0_8px_24px_rgba(0,0,0,.18)]',
                            mobile ? 'gap-2.5 p-3' : 'gap-3 p-4',
                            popup
                                ? 'left-1/2 top-1/2 max-h-[calc(100%-24px)] w-[86%] max-w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-lg'
                                : 'bottom-0 right-0 top-0 w-[72%] max-w-[400px] rounded-l-lg',
                            // Narrow frames (design `.device-frame` rules).
                            device === 'tablet' && 'w-[92%]',
                            mobile && ( popup ? 'w-[92%]' : 'w-[88%]' )
                        ) }
                        style={ { background: values.widget_bg_color } }
                    >
                        <header className="flex items-center justify-between">
                            <h3 className="m-0 flex items-center gap-[7px] text-sm font-bold text-[#141414]">
                                { __(
                                    'Shopping Cart',
                                    'storegrowth-sales-booster'
                                ) }
                                <span className="inline-flex h-[17px] min-w-[17px] items-center justify-center rounded-full bg-sg-brand px-1 text-[10px] font-bold text-white">
                                    2
                                </span>
                            </h3>
                            <Button
                                variant="ghost"
                                onClick={ () => onOpenChange( false ) }
                                aria-label={ __(
                                    'Close cart',
                                    'storegrowth-sales-booster'
                                ) }
                                className="size-[23px] rounded-full bg-[#F4F4F5] p-0 text-[#25252D] hover:bg-[#E4E4E7]"
                            >
                                <X
                                    className="size-[13px]"
                                    strokeWidth={ 2 }
                                    aria-hidden
                                />
                            </Button>
                        </header>

                        <CartLine
                            values={ values }
                            isPro={ isPro }
                            mobile={ mobile }
                        />
                        <CartLine
                            values={ values }
                            isPro={ isPro }
                            mobile={ mobile }
                            free
                        />

                        { isPro && values.show_free_shipping_message && (
                            <p className="m-0 rounded-[7px] bg-[#EFF6FF] px-[13px] py-2 text-center text-[11px] font-medium text-[#1D4ED8]">
                                { sprintf(
                                    /* translators: %s: amount left for free shipping. */
                                    __(
                                        'Add more %s to get free shipping.',
                                        'storegrowth-sales-booster'
                                    ),
                                    '$75.00'
                                ) }
                            </p>
                        ) }

                        { isPro && values.show_coupon && (
                            <div className="flex flex-col gap-[5px]">
                                <span className="text-[11px] font-semibold text-[#141414]">
                                    { __(
                                        'Promo Code',
                                        'storegrowth-sales-booster'
                                    ) }
                                </span>
                                <span className="flex overflow-hidden rounded-[7px] border border-[#E4E4E7]">
                                    <span className="flex-auto py-1 pl-2.5 text-[11px] leading-[26px] text-[#A1A1AA]">
                                        { __(
                                            'Type here',
                                            'storegrowth-sales-booster'
                                        ) }
                                    </span>
                                    <span className="shrink-0 bg-[#E0E0E0] px-[15px] py-2 text-[11px] font-medium text-[#141414]">
                                        { __(
                                            'Apply Now',
                                            'storegrowth-sales-booster'
                                        ) }
                                    </span>
                                </span>
                            </div>
                        ) }

                        <dl className="m-0 flex flex-col gap-1.5 text-[11px]">
                            <div className="flex items-center justify-between">
                                <dt className="text-[#71717A]">
                                    { __(
                                        'Subtotal',
                                        'storegrowth-sales-booster'
                                    ) }
                                </dt>
                                <dd className="m-0 font-semibold text-[#141414]">
                                    $42.00
                                </dd>
                            </div>
                            <div className="flex items-center justify-between">
                                <dt className="text-[#71717A]">
                                    { __(
                                        'Total',
                                        'storegrowth-sales-booster'
                                    ) }
                                </dt>
                                <dd className="m-0 font-bold text-[#141414]">
                                    $42.00
                                </dd>
                            </div>
                        </dl>

                        <div className="flex gap-2.5">
                            <span
                                className="flex min-h-[33px] flex-1 items-center justify-center rounded text-[11px] font-medium text-white"
                                style={ {
                                    background: values.shopping_button_bg_color,
                                } }
                            >
                                { __(
                                    'Keep Shopping',
                                    'storegrowth-sales-booster'
                                ) }
                            </span>
                            <span
                                className="flex min-h-[33px] flex-1 items-center justify-center rounded text-[11px] font-medium text-white"
                                style={ button }
                            >
                                { __(
                                    'Checkout',
                                    'storegrowth-sales-booster'
                                ) }
                            </span>
                        </div>
                    </section>
                </>
            ) }

            <Button
                onClick={ () => onOpenChange( true ) }
                aria-label={ __( 'Open cart', 'storegrowth-sales-booster' ) }
                className={ cn(
                    'absolute z-[2] size-[34px] rounded-lg border-0 p-0 shadow-[0_4px_12px_rgba(0,0,0,.18)] hover:opacity-90',
                    position
                ) }
                style={ { ...button, color: values.icon_color } }
            >
                <icon.Icon className="size-5" strokeWidth={ 1.5 } aria-hidden />
                { /* The item count, as on the storefront button. */ }
                <span
                    className="absolute -right-[7px] -top-[7px] flex size-[18px] items-center justify-center rounded-full text-[10px] font-semibold shadow-[0_1px_3px_rgba(0,0,0,.15)]"
                    style={ {
                        background: values.icon_color,
                        color: values.buttons_bg_color,
                    } }
                    aria-hidden
                >
                    2
                </span>
            </Button>
        </div>
    );
}
