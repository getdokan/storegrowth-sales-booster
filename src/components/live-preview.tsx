/**
 * Live preview column (design `buildPreview()`): "Preview" head with a device
 * switch and a light/dark toggle, then a grey canvas holding a browser frame
 * with a mock product page (or shop, or checkout). The module's widget
 * renders in the page's widget slot; `banner` renders above (or below) the
 * product, `overlay` on top of the frame.
 *
 * The frame carries `group/frame` with `data-device` / `data-theme`, so a
 * widget styles its dark or mobile look with
 * `group-data-[theme=dark]/frame:…` / `group-data-[device=mobile]/frame:…`.
 *
 * @since SPSG_VERSION
 */
import { Toggle, ToggleGroup, ToggleGroupItem, cn } from '@wedevs/plugin-ui';
import { useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import {
    Monitor,
    RectangleVertical,
    Star,
    SunMoon,
    Tablet,
    type LucideIcon,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { assetUrl } from '@storegrowth/utilities';

export type PreviewDevice = 'desktop' | 'tablet' | 'mobile';
export type PreviewTheme = 'light' | 'dark';

export interface PreviewState {
    device: PreviewDevice;
    theme: PreviewTheme;
}

type Slot = ReactNode | ( ( state: PreviewState ) => ReactNode );

export interface LivePreviewProps {
    /** The page drawn: a single product (default), a shop grid or the checkout. */
    layout?: 'product' | 'shop' | 'checkout';
    /**
     * Rendered in the product's widget slot, above the add-to-cart row (in
     * every card of the shop grid; under the checkout's order total).
     */
    widget?: Slot;
    /** Full-width strip above (or below) the product, e.g. a bar. */
    banner?: Slot;
    bannerPosition?: 'top' | 'bottom';
    /** Floats over the frame, e.g. a popup. */
    overlay?: Slot;
    /** Under the frame, e.g. a note. */
    footer?: Slot;
    /** Page height (px) behind a tall overlay, e.g. a cart panel. */
    minHeight?: number;
    /**
     * The "Preview" heading's element (default `h2`), e.g. `h4` under a host
     * page's own heading (the Dokan vendor dashboard's `h3`).
     */
    headingTag?: 'h2' | 'h3' | 'h4';
}

const DEVICES: Array< {
    id: PreviewDevice;
    label: string;
    Icon: LucideIcon;
} > = [
    {
        id: 'desktop',
        label: __( 'Desktop width', 'storegrowth-sales-booster' ),
        Icon: Monitor,
    },
    {
        id: 'tablet',
        label: __( 'Tablet width', 'storegrowth-sales-booster' ),
        Icon: Tablet,
    },
    {
        id: 'mobile',
        label: __( 'Mobile width', 'storegrowth-sales-booster' ),
        Icon: RectangleVertical,
    },
];

/**
 * Render a slot.
 *
 * @param slot  Node or render function.
 * @param state Device and theme.
 */
function render( slot: Slot, state: PreviewState ): ReactNode {
    return typeof slot === 'function' ? slot( state ) : slot;
}

/**
 * Mock single-product page with a widget slot (design `.mock-product`).
 *
 * @param props        Props.
 * @param props.widget Widget node.
 */
function MockProduct( { widget }: { widget: ReactNode } ) {
    const copy =
        'w-full text-[14px] font-semibold leading-[1.3] text-[#1A1D20] group-data-[theme=dark]/frame:text-[#E7E9EC]';
    const bar =
        'h-1 w-full bg-[#D9D9D9] group-data-[theme=dark]/frame:bg-[#33373C]';

    return (
        <div className="flex w-full items-start gap-5 bg-white px-6 py-[46px] max-[620px]:flex-col max-[620px]:items-stretch max-[620px]:gap-4 max-[620px]:px-3 max-[620px]:py-6 group-data-[device=tablet]/frame:px-4 group-data-[device=tablet]/frame:py-8 group-data-[device=mobile]/frame:flex-col group-data-[device=mobile]/frame:items-stretch group-data-[device=mobile]/frame:gap-4 group-data-[device=mobile]/frame:px-3 group-data-[device=mobile]/frame:py-6 group-data-[theme=dark]/frame:bg-[#16181B]">
            <div className="h-[180px] min-w-24 shrink grow-0 basis-[200px] overflow-hidden rounded-[4.048px] bg-[#EDEDED] max-[620px]:h-[140px] max-[620px]:w-full max-[620px]:basis-auto group-data-[device=mobile]/frame:h-[140px] group-data-[device=mobile]/frame:w-full group-data-[device=mobile]/frame:basis-auto group-data-[theme=dark]/frame:bg-[#24272B]">
                <img
                    src={ assetUrl( 'images/preview/product.jpeg' ) }
                    alt=""
                    className="block h-full w-full object-cover"
                />
            </div>

            <div className="flex min-w-px flex-1 flex-col items-start gap-8">
                <div className="flex w-full flex-col items-start gap-4">
                    <p className={ copy }>
                        { __(
                            'Your Product Name',
                            'storegrowth-sales-booster'
                        ) }
                    </p>
                    <div className="flex w-full items-center gap-[2.024px]">
                        { [ 0, 1, 2, 3, 4 ].map( ( index ) => (
                            <Star
                                key={ index }
                                className={ cn(
                                    'size-[12.144px]',
                                    index < 4
                                        ? 'fill-[#F59E0B] text-[#F59E0B]'
                                        : 'fill-[#D7D7D7] text-[#D7D7D7]'
                                ) }
                                strokeWidth={ 1.5 }
                                aria-hidden
                            />
                        ) ) }
                        <span className="w-[4.004px]" />
                        <span className="text-[7.084px] text-[#8C9196] group-data-[theme=dark]/frame:text-[#E7E9EC]">
                            { __( 'reviews', 'storegrowth-sales-booster' ) }
                        </span>
                    </div>
                    <p className={ copy }>$49</p>
                    <div className="flex w-full flex-col items-start gap-4">
                        <span className={ bar } />
                        <span className={ bar } />
                        <span className={ cn( bar, 'w-[160px] max-w-full' ) } />
                    </div>
                </div>

                { widget }

                <div className="flex w-full items-center gap-[8.096px]">
                    <div className="flex shrink-0 items-center gap-[8.096px] rounded-[2.024px] border-[0.506px] border-[#E0E0E0] px-[8.096px] py-[6.072px] text-[12px] leading-[1.4] group-data-[theme=dark]/frame:border-[#3A3E44]">
                        <span className="text-[#8C9196]">+</span>
                        <span className="text-[#1A1D20] group-data-[theme=dark]/frame:text-[#E7E9EC]">
                            1
                        </span>
                        <span className="text-[#8C9196]">-</span>
                    </div>
                    <div className="flex min-w-px flex-1 items-center justify-center rounded-[4px] bg-[#E1E2E4] py-[7.084px] group-data-[theme=dark]/frame:bg-[#2A2E33]">
                        <span className="text-[12px] font-semibold leading-[1.3] text-[#111] group-data-[theme=dark]/frame:text-[#E7E9EC]">
                            { __( 'ADD TO CART', 'storegrowth-sales-booster' ) }
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}

/**
 * Mock shop page (design `.shop-grid`): product cards, each with the widget
 * under its name and price. Three across, two on tablet, one on phones.
 *
 * @param props        Props.
 * @param props.widget Widget node, drawn in every card.
 */
function MockShop( { widget }: { widget: ReactNode } ) {
    return (
        <div className="grid w-full grid-cols-3 gap-4 bg-white p-8 group-data-[device=mobile]/frame:grid-cols-1 group-data-[device=mobile]/frame:p-5 group-data-[device=tablet]/frame:grid-cols-2 group-data-[theme=dark]/frame:bg-[#16181B]">
            { [ 0, 1, 2 ].map( ( index ) => (
                <div
                    key={ index }
                    className="flex flex-col items-center gap-2 text-center group-data-[device=tablet]/frame:[&:nth-child(3)]:hidden"
                >
                    <div className="aspect-square w-full overflow-hidden rounded bg-[#EDEDED] group-data-[theme=dark]/frame:bg-[#24272B]">
                        <img
                            src={ assetUrl( 'images/preview/product.jpeg' ) }
                            alt=""
                            className="block h-full w-full object-cover"
                        />
                    </div>
                    <p className="m-0 text-[13px] font-medium text-[#1A1D20] group-data-[theme=dark]/frame:text-[#E7E9EC]">
                        { __(
                            'Your Product Name',
                            'storegrowth-sales-booster'
                        ) }
                    </p>
                    <p className="-mt-1 mb-0 text-[12px] text-[#8C9196] group-data-[theme=dark]/frame:text-[#9CA3AF]">
                        $49
                    </p>
                    { widget }
                </div>
            ) ) }
        </div>
    );
}

/**
 * Mock checkout page: the customer form on the left, the order summary on
 * the right (one line, subtotal, total), with the widget under the total
 * and the Place order button last, where a checkout box such as an order
 * bump sits. The columns stack in a narrow frame (a container query, not the
 * device: the preview column itself is narrow), the summary under the form,
 * as WooCommerce's checkout does.
 *
 * @param props        Props.
 * @param props.widget Widget node, drawn in the order summary.
 */
function MockCheckout( { widget }: { widget: ReactNode } ) {
    const heading =
        'm-0 text-[13px] font-semibold leading-[1.3] text-[#1A1D20] group-data-[theme=dark]/frame:text-[#E7E9EC]';
    const input =
        'h-9 w-full rounded-[4px] border border-[#DCDCDE] bg-white group-data-[theme=dark]/frame:border-[#3A3E44] group-data-[theme=dark]/frame:bg-[#1E2124]';
    const row =
        'flex w-full items-center justify-between gap-3 text-[12px] leading-[1.4] text-[#1A1D20] group-data-[theme=dark]/frame:text-[#E7E9EC]';

    // Side by side only where the frame is as wide as a real checkout's two
    // columns need (the preview column is often narrower): the summary is
    // then about as wide as it is in a store.
    return (
        <div className="@container w-full bg-white group-data-[theme=dark]/frame:bg-[#16181B]">
            <div className="flex w-full flex-col items-stretch gap-6 px-4 py-6 @min-[640px]:flex-row @min-[640px]:items-start @min-[640px]:px-6 @min-[640px]:py-10">
                <div className="flex min-w-0 flex-1 flex-col gap-5">
                    <div className="flex w-full flex-col gap-2.5">
                        <p className={ heading }>
                            { __(
                                'Contact information',
                                'storegrowth-sales-booster'
                            ) }
                        </p>
                        <span className={ input } />
                    </div>
                    <div className="flex w-full flex-col gap-2.5">
                        <p className={ heading }>
                            { __(
                                'Shipping address',
                                'storegrowth-sales-booster'
                            ) }
                        </p>
                        <div className="flex w-full gap-2.5">
                            <span className={ input } />
                            <span className={ input } />
                        </div>
                        <span className={ input } />
                        <span className={ input } />
                    </div>
                </div>

                <div className="flex w-full min-w-0 shrink-0 flex-col gap-3 rounded-[4px] border border-[#E0E0E0] p-4 @min-[640px]:w-[48%] group-data-[theme=dark]/frame:border-[#3A3E44]">
                    <p className={ heading }>
                        { __( 'Order summary', 'storegrowth-sales-booster' ) }
                    </p>
                    <div className={ row }>
                        <span className="flex min-w-0 items-center gap-2.5">
                            <img
                                src={ assetUrl(
                                    'images/preview/product.jpeg'
                                ) }
                                alt=""
                                className="size-10 shrink-0 rounded-[4px] object-cover"
                            />
                            <span className="min-w-0">
                                { __(
                                    'Your Product Name',
                                    'storegrowth-sales-booster'
                                ) }
                            </span>
                        </span>
                        <span className="shrink-0">$49</span>
                    </div>
                    <span className="h-px w-full bg-[#E0E0E0] group-data-[theme=dark]/frame:bg-[#3A3E44]" />
                    <div className={ row }>
                        <span>
                            { __( 'Subtotal', 'storegrowth-sales-booster' ) }
                        </span>
                        <span>$49</span>
                    </div>
                    <div className={ cn( row, 'text-[14px] font-semibold' ) }>
                        <span>
                            { __( 'Total', 'storegrowth-sales-booster' ) }
                        </span>
                        <span>$49</span>
                    </div>
                    { widget }
                    <div className="flex w-full items-center justify-center rounded-[4px] bg-[#1A1D20] py-2.5 group-data-[theme=dark]/frame:bg-[#E7E9EC]">
                        <span className="text-[12px] font-semibold leading-[1.3] text-white group-data-[theme=dark]/frame:text-[#16181B]">
                            { __( 'Place order', 'storegrowth-sales-booster' ) }
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}

/**
 * The page the preview draws.
 *
 * @param props        Props.
 * @param props.layout Page layout.
 * @param props.widget Widget node.
 */
function MockPage( {
    layout,
    widget,
}: {
    layout: NonNullable< LivePreviewProps[ 'layout' ] >;
    widget: ReactNode;
} ) {
    if ( layout === 'shop' ) {
        return <MockShop widget={ widget } />;
    }

    if ( layout === 'checkout' ) {
        return <MockCheckout widget={ widget } />;
    }

    return <MockProduct widget={ widget } />;
}

/**
 * @since SPSG_VERSION
 *
 * @param props                Props.
 * @param props.layout         Single product, shop or checkout page.
 * @param props.widget         Widget in the product's slot.
 * @param props.banner         Strip above or below the product.
 * @param props.bannerPosition Where the banner goes.
 * @param props.overlay        Floats over the frame.
 * @param props.footer         Under the frame.
 * @param props.minHeight      Page height behind a tall overlay.
 * @param props.headingTag     The "Preview" heading's element.
 */
export function LivePreview( {
    layout = 'product',
    widget,
    banner,
    bannerPosition = 'top',
    overlay,
    footer,
    minHeight,
    headingTag: Heading = 'h2',
}: LivePreviewProps ) {
    const [ device, setDevice ] = useState< PreviewDevice >( 'desktop' );
    const [ theme, setTheme ] = useState< PreviewTheme >( 'light' );
    const state = { device, theme };

    const bannerNode = banner ? render( banner, state ) : null;

    return (
        <>
            <div className="flex w-full items-center justify-between gap-4 border border-l-0 border-t-0 border-sg-cardline bg-white px-6 py-3 @max-[932px]:border-l">
                <div className="min-w-0 flex-1">
                    <Heading className="m-0 text-[14px] font-semibold leading-[1.3] text-sg-heading">
                        { __( 'Preview', 'storegrowth-sales-booster' ) }
                    </Heading>
                </div>
                <ToggleGroup
                    aria-label={ __(
                        'Preview width',
                        'storegrowth-sales-booster'
                    ) }
                    value={ [ device ] }
                    // Clicking the pressed device empties the group; keep it.
                    onValueChange={ ( next ) =>
                        next[ 0 ] && setDevice( next[ 0 ] as PreviewDevice )
                    }
                    spacing={ 2 }
                    className="shrink-0"
                >
                    { DEVICES.map( ( { id, label, Icon } ) => (
                        <ToggleGroupItem
                            key={ id }
                            value={ id }
                            aria-label={ label }
                            className="size-9 p-2 text-sg-text hover:bg-sg-chip aria-pressed:bg-sg-brand aria-pressed:text-white"
                        >
                            <Icon
                                className="size-5"
                                strokeWidth={ 1.5 }
                                aria-hidden
                            />
                        </ToggleGroupItem>
                    ) ) }
                </ToggleGroup>
                <div className="flex flex-1 justify-end">
                    <Toggle
                        pressed={ theme === 'dark' }
                        onPressedChange={ ( dark ) =>
                            setTheme( dark ? 'dark' : 'light' )
                        }
                        aria-label={ __(
                            'Toggle preview theme',
                            'storegrowth-sales-booster'
                        ) }
                        className="size-9 rounded-full bg-sg-chip p-2 text-sg-heading hover:bg-[#E7E9EC] aria-pressed:bg-sg-brand aria-pressed:text-white"
                    >
                        <SunMoon
                            className="size-5"
                            strokeWidth={ 1.5 }
                            aria-hidden
                        />
                    </Toggle>
                </div>
            </div>

            <div className="flex w-full flex-auto flex-col items-center gap-14 rounded-br-lg border border-l-0 border-t-0 border-sg-cardline bg-sg-preview p-10 @max-[932px]:rounded-b-lg @max-[932px]:border-l max-[782px]:gap-6 max-[782px]:p-4">
                <div
                    data-device={ device }
                    data-theme={ theme }
                    className={ cn(
                        'group/frame relative w-full overflow-clip rounded-[4.004px] bg-white transition-[max-width] duration-200 ease-in-out',
                        device === 'desktop' && 'max-w-full',
                        device === 'tablet' && 'max-w-[520px]',
                        device === 'mobile' && 'max-w-[320px]'
                    ) }
                >
                    <div className="flex h-[20.462px] w-full items-center gap-[4.048px] bg-[#333] px-[8.096px]">
                        <span className="h-[6.139px] w-[6.007px] rounded-full bg-[#FF5F57]" />
                        <span className="h-[6.139px] w-[6.007px] rounded-full bg-[#FEBC2E]" />
                        <span className="h-[6.139px] w-[6.007px] rounded-full bg-[#28C840]" />
                    </div>
                    <div
                        className={ cn(
                            'relative w-full',
                            device === 'mobile' &&
                                'max-h-[560px] min-h-[560px] overflow-y-auto'
                        ) }
                        style={
                            minHeight && device !== 'mobile'
                                ? { minHeight }
                                : undefined
                        }
                    >
                        { bannerPosition === 'top' && bannerNode }
                        <MockPage
                            layout={ layout }
                            widget={ widget ? render( widget, state ) : null }
                        />
                        { bannerPosition === 'bottom' && bannerNode }
                    </div>
                    { overlay && render( overlay, state ) }
                </div>
                { footer && (
                    <div className="flex w-full max-w-[610px] justify-start">
                        { render( footer, state ) }
                    </div>
                ) }
            </div>
        </>
    );
}
