/**
 * Live preview column (design `buildPreview()`): "Preview" head with a device
 * switch and a light/dark toggle, then a grey canvas holding a browser frame
 * with a mock product page. The module's widget renders in the product's
 * widget slot; `banner` renders above (or below) the product, `overlay` on
 * top of the frame.
 *
 * The frame carries `group/frame` with `data-device` / `data-theme`, so a
 * widget styles its dark or mobile look with
 * `group-data-[theme=dark]/frame:…` / `group-data-[device=mobile]/frame:…`.
 *
 * @since SPSG_VERSION
 */
import { cn } from '@wedevs/plugin-ui';
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
    /** Rendered in the product's widget slot, above the add-to-cart row. */
    widget?: Slot;
    /** Full-width strip above (or below) the product, e.g. a bar. */
    banner?: Slot;
    bannerPosition?: 'top' | 'bottom';
    /** Floats over the frame, e.g. a popup. */
    overlay?: Slot;
    /** Under the frame, e.g. a note. */
    footer?: ReactNode;
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
 * @since SPSG_VERSION
 *
 * @param props                Props.
 * @param props.widget         Widget in the product's slot.
 * @param props.banner         Strip above or below the product.
 * @param props.bannerPosition Where the banner goes.
 * @param props.overlay        Floats over the frame.
 * @param props.footer         Under the frame.
 */
export function LivePreview( {
    widget,
    banner,
    bannerPosition = 'top',
    overlay,
    footer,
}: LivePreviewProps ) {
    const [ device, setDevice ] = useState< PreviewDevice >( 'desktop' );
    const [ theme, setTheme ] = useState< PreviewTheme >( 'light' );
    const state = { device, theme };

    const bannerNode = banner ? render( banner, state ) : null;

    return (
        <>
            <div className="flex w-full items-center justify-between gap-4 rounded-tr-lg border border-l-0 border-[#EAEAEA] bg-white px-6 py-3 max-[1100px]:rounded-none max-[1100px]:border-l max-[1100px]:border-t-0">
                <div className="min-w-0 flex-1">
                    <h2 className="text-[14px] font-semibold leading-[1.3] text-sg-heading">
                        { __( 'Preview', 'storegrowth-sales-booster' ) }
                    </h2>
                </div>
                <div
                    role="radiogroup"
                    aria-label={ __(
                        'Preview width',
                        'storegrowth-sales-booster'
                    ) }
                    className="inline-flex shrink-0 items-start gap-2"
                >
                    { DEVICES.map( ( { id, label, Icon } ) => (
                        <button
                            key={ id }
                            type="button"
                            role="radio"
                            aria-checked={ device === id }
                            aria-label={ label }
                            className={ cn(
                                'flex shrink-0 cursor-pointer items-center justify-center rounded-md border-0 p-2',
                                device === id
                                    ? 'bg-sg-brand text-white'
                                    : 'bg-white text-sg-text'
                            ) }
                            onClick={ () => setDevice( id ) }
                        >
                            <Icon
                                className="size-5"
                                strokeWidth={ 1.5 }
                                aria-hidden
                            />
                        </button>
                    ) ) }
                </div>
                <div className="flex flex-1 justify-end">
                    <button
                        type="button"
                        aria-pressed={ theme === 'dark' }
                        aria-label={ __(
                            'Toggle preview theme',
                            'storegrowth-sales-booster'
                        ) }
                        className={ cn(
                            'flex shrink-0 cursor-pointer items-center justify-center rounded-full border-0 p-2',
                            theme === 'dark'
                                ? 'bg-sg-brand text-white'
                                : 'bg-sg-chip text-sg-heading hover:bg-[#E7E9EC]'
                        ) }
                        onClick={ () =>
                            setTheme( theme === 'dark' ? 'light' : 'dark' )
                        }
                    >
                        <SunMoon
                            className="size-5"
                            strokeWidth={ 1.5 }
                            aria-hidden
                        />
                    </button>
                </div>
            </div>

            <div className="flex w-full flex-auto flex-col items-center gap-14 rounded-br-lg border border-l-0 border-t-0 border-[#EAEAEA] bg-[#E6E6E6] p-10 max-[1100px]:rounded-b-lg max-[1100px]:border-l max-[782px]:gap-6 max-[782px]:p-4">
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
                    >
                        { bannerPosition === 'top' && bannerNode }
                        <MockProduct
                            widget={ widget ? render( widget, state ) : null }
                        />
                        { bannerPosition === 'bottom' && bannerNode }
                    </div>
                    { overlay && render( overlay, state ) }
                </div>
                { footer && (
                    <div className="flex w-full max-w-[610px] justify-start">
                        { footer }
                    </div>
                ) }
            </div>
        </>
    );
}
