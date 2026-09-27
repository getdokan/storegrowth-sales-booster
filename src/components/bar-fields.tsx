/**
 * Fields the two storefront bars share (Free Shipping Rules, Floating Bar;
 * PHP `DisplaySettings::bar_fields()` / `targeting_fields()`): placement,
 * devices, trigger, page targeting, size and font, and the icon picker.
 * Each page arranges them in its own cards.
 *
 * @since SPSG_VERSION
 */
import {
    Button,
    LabeledRadio,
    RadioGroup,
    ToggleGroup,
    ToggleGroupItem,
} from '@wedevs/plugin-ui';
import { useId } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { Upload, type LucideIcon } from 'lucide-react';
import type { SettingValue } from '@storegrowth/utilities';

import {
    CheckboxField,
    MultiSelectField,
    NumberField,
    ProBadge,
    SelectField,
    TextField,
} from './fields';
import { FIELD_LABEL } from './fields/field-label';

/** Keys of the shared bar and targeting fields, as the settings API returns them. */
export interface BarValues extends Record< string, SettingValue > {
    bar_type: 'normal' | 'sticky';
    bar_position: 'top' | 'bottom';
    banner_device_view: string[];
    banner_trigger: 'after-few-seconds' | 'after-scroll';
    banner_delay: number;
    scroll_banner_delay: number;
    banner_height: number;
    font_size: number;
    font_family: string;
    background_color: string;
    text_color: string;
    icon_color: string;
    close_icon_color: string;
    banner_show_option: 'banner-show-everywhere' | 'banner-show-selected';
    slected_page_option: string[];
    user_type: 'both' | 'logged_in' | 'not_logged_in';
}

export type BarKey = keyof BarValues & string;

/** Stored font → CSS family (PHP `DisplaySettings::BAR_FONTS`). */
export const BAR_FONTS: Record< string, string > = {
    poppins: 'Poppins',
    inter: 'Inter',
    roboto: 'Roboto',
    open_sans: 'Open Sans',
    lato: 'Lato',
    montserrat: 'Montserrat',
    ibm_plex_sans: 'IBM Plex Sans',
};

export interface BarFieldsProps {
    values: BarValues;
    setValue: ( key: BarKey, value: SettingValue ) => void;
    isLocked: ( key: BarKey ) => boolean;
    errors: Partial< Record< string, string > >;
}

const PAGE_CONDITIONS = [
    {
        value: 'is_front_page',
        label: __( 'Front page', 'storegrowth-sales-booster' ),
    },
    { value: 'is_home', label: __( 'Blog page', 'storegrowth-sales-booster' ) },
    {
        value: 'is_singular',
        label: __(
            'Any single post, page or product',
            'storegrowth-sales-booster'
        ),
    },
    { value: 'is_page', label: __( 'Pages', 'storegrowth-sales-booster' ) },
    {
        value: 'is_attachment',
        label: __( 'Attachment pages', 'storegrowth-sales-booster' ),
    },
    {
        value: 'is_search',
        label: __( 'Search results', 'storegrowth-sales-booster' ),
    },
    { value: 'is_404', label: __( '404 page', 'storegrowth-sales-booster' ) },
    {
        value: 'is_archive',
        label: __( 'Archives', 'storegrowth-sales-booster' ),
    },
    {
        value: 'is_category',
        label: __( 'Category archives', 'storegrowth-sales-booster' ),
    },
    {
        value: 'is_tag',
        label: __( 'Tag archives', 'storegrowth-sales-booster' ),
    },
];

/**
 * Whether a preview width gets the storefront's mobile rules (the storefront
 * scripts treat up to 768px as mobile; the tablet frame is narrower).
 *
 * @since SPSG_VERSION
 *
 * @param device Preview width.
 */
export function isMobilePreview( device: string ): boolean {
    return device !== 'desktop';
}

/**
 * Whether the bar shows at a preview width, as the storefront script
 * decides it (`banner-show-mobile` / `banner-show-desktop`).
 *
 * @since SPSG_VERSION
 *
 * @param devices `banner_device_view`.
 * @param device  Preview width.
 */
export function barShowsOn( devices: string[], device: string ): boolean {
    return ( devices ?? [] ).includes(
        isMobilePreview( device ) ? 'banner-show-mobile' : 'banner-show-desktop'
    );
}

const bind = ( props: BarFieldsProps, key: BarKey ) => ( {
    locked: props.isLocked( key ),
    error: props.errors[ key ],
} );

/**
 * Bar Position and Bar Type.
 *
 * @since SPSG_VERSION
 *
 * @param props Values and handlers.
 */
export function BarPlacementFields( props: BarFieldsProps ) {
    const { values, setValue } = props;

    return (
        <>
            <SelectField
                label={ __( 'Bar Position', 'storegrowth-sales-booster' ) }
                value={ values.bar_position }
                options={ [
                    {
                        value: 'top',
                        label: __( 'Top', 'storegrowth-sales-booster' ),
                    },
                    {
                        value: 'bottom',
                        label: __( 'Bottom', 'storegrowth-sales-booster' ),
                    },
                ] }
                onChange={ ( next ) => setValue( 'bar_position', next ) }
                { ...bind( props, 'bar_position' ) }
            />
            <SelectField
                label={ __( 'Bar Type', 'storegrowth-sales-booster' ) }
                value={ values.bar_type }
                options={ [
                    {
                        value: 'normal',
                        label: __( 'Normal', 'storegrowth-sales-booster' ),
                    },
                    {
                        value: 'sticky',
                        label: __( 'Sticky', 'storegrowth-sales-booster' ),
                    },
                ] }
                onChange={ ( next ) => setValue( 'bar_type', next ) }
                { ...bind( props, 'bar_type' ) }
            />
        </>
    );
}

/**
 * Show on desktop / mobile (`banner_device_view`).
 *
 * @since SPSG_VERSION
 *
 * @param props       Values and handlers.
 * @param props.label Field label.
 */
export function BarDeviceField( props: BarFieldsProps & { label: string } ) {
    const { values, setValue, label } = props;

    return (
        <DeviceField
            label={ label }
            value={ values.banner_device_view ?? [] }
            desktop="banner-show-desktop"
            mobile="banner-show-mobile"
            onChange={ ( next ) => setValue( 'banner_device_view', next ) }
            locked={ bind( props, 'banner_device_view' ).locked }
        />
    );
}

export interface DeviceFieldProps {
    label: string;
    /** Stored list of the chosen device values. */
    value: string[];
    /** Stored value for desktop, e.g. `banner-show-desktop`. */
    desktop: string;
    /** Stored value for mobile. */
    mobile: string;
    onChange: ( value: string[] ) => void;
    locked?: boolean;
}

/**
 * Desktop / Mobile checkboxes on one row with their label (design
 * `.field-row`).
 *
 * @since SPSG_VERSION
 *
 * @param props          Props.
 * @param props.label    Label.
 * @param props.value    Chosen values.
 * @param props.desktop  Desktop value.
 * @param props.mobile   Mobile value.
 * @param props.onChange Change handler.
 * @param props.locked   Pro field without pro.
 */
export function DeviceField( {
    label,
    value,
    desktop,
    mobile,
    onChange,
    locked,
}: DeviceFieldProps ) {
    const labelId = useId();

    const toggle = ( device: string, on: boolean ) =>
        onChange(
            on
                ? [ ...value.filter( ( item ) => item !== device ), device ]
                : value.filter( ( item ) => item !== device )
        );

    return (
        <div
            role="group"
            aria-labelledby={ labelId }
            className="flex w-full items-center justify-between gap-4"
        >
            <span
                id={ labelId }
                className={ `flex items-center gap-2 ${ FIELD_LABEL }` }
            >
                { label }
                { locked && <ProBadge /> }
            </span>
            <span className="flex shrink-0 items-center gap-4">
                { [
                    [ desktop, __( 'Desktop', 'storegrowth-sales-booster' ) ],
                    [ mobile, __( 'Mobile', 'storegrowth-sales-booster' ) ],
                ].map( ( [ device, name ] ) => (
                    <span key={ device }>
                        <CheckboxField
                            label={ name }
                            checked={ value.includes( device ) }
                            onChange={ ( on ) => toggle( device, on ) }
                            locked={ locked }
                        />
                    </span>
                ) ) }
            </span>
        </div>
    );
}

/**
 * Trigger: after a delay, or after scrolling past the bar then a delay
 * (both in seconds).
 *
 * @since SPSG_VERSION
 *
 * @param props Values and handlers.
 */
export function BarTriggerFields( props: BarFieldsProps ) {
    const { values, setValue } = props;
    const scroll = values.banner_trigger === 'after-scroll';
    const delayKey = scroll ? 'scroll_banner_delay' : 'banner_delay';
    const { locked } = bind( props, 'banner_trigger' );
    const labelId = useId();

    return (
        <>
            <div className="flex w-full flex-col items-start gap-3">
                <span
                    id={ labelId }
                    className={ `flex items-center gap-2 ${ FIELD_LABEL }` }
                >
                    { __( 'Trigger', 'storegrowth-sales-booster' ) }
                    { locked && <ProBadge /> }
                </span>
                <RadioGroup
                    aria-labelledby={ labelId }
                    value={ values.banner_trigger }
                    onValueChange={ ( next ) =>
                        setValue( 'banner_trigger', next as string )
                    }
                    disabled={ locked }
                    className="flex flex-col gap-3"
                >
                    <LabeledRadio
                        value="after-few-seconds"
                        label={ __(
                            'After a few seconds',
                            'storegrowth-sales-booster'
                        ) }
                    />
                    <LabeledRadio
                        value="after-scroll"
                        label={ __(
                            'After scroll',
                            'storegrowth-sales-booster'
                        ) }
                    />
                </RadioGroup>
            </div>
            <NumberField
                label={
                    scroll
                        ? __(
                              'Delay after scrolling past the bar',
                              'storegrowth-sales-booster'
                          )
                        : __(
                              'Delay before showing',
                              'storegrowth-sales-booster'
                          )
                }
                suffix={ __( 'sec', 'storegrowth-sales-booster' ) }
                min={ 0 }
                value={ values[ delayKey ] }
                onChange={ ( next ) => setValue( delayKey, next ) }
                { ...bind( props, delayKey ) }
            />
        </>
    );
}

/**
 * Page and audience targeting (pro 2.2.0 evaluates them).
 *
 * @since SPSG_VERSION
 *
 * @param props Values and handlers.
 */
export function TargetingFields( props: BarFieldsProps ) {
    const { values, setValue } = props;

    return (
        <>
            <SelectField
                label={ __( 'Show', 'storegrowth-sales-booster' ) }
                value={ values.banner_show_option }
                options={ [
                    {
                        value: 'banner-show-everywhere',
                        label: __(
                            'Show Everywhere',
                            'storegrowth-sales-booster'
                        ),
                    },
                    {
                        value: 'banner-show-selected',
                        label: __(
                            'Show on Specific Pages',
                            'storegrowth-sales-booster'
                        ),
                    },
                ] }
                onChange={ ( next ) => setValue( 'banner_show_option', next ) }
                { ...bind( props, 'banner_show_option' ) }
            />
            { values.banner_show_option === 'banner-show-selected' && (
                <MultiSelectField
                    label={ __( 'Pages', 'storegrowth-sales-booster' ) }
                    value={ values.slected_page_option }
                    options={ PAGE_CONDITIONS }
                    onChange={ ( next ) =>
                        setValue( 'slected_page_option', next as string[] )
                    }
                    { ...bind( props, 'slected_page_option' ) }
                />
            ) }
            <SelectField
                label={ __( 'Who Can See', 'storegrowth-sales-booster' ) }
                value={ values.user_type }
                options={ [
                    {
                        value: 'both',
                        label: __( 'Everyone', 'storegrowth-sales-booster' ),
                    },
                    {
                        value: 'logged_in',
                        label: __(
                            'Logged-in customers',
                            'storegrowth-sales-booster'
                        ),
                    },
                    {
                        value: 'not_logged_in',
                        label: __( 'Guests only', 'storegrowth-sales-booster' ),
                    },
                ] }
                onChange={ ( next ) => setValue( 'user_type', next ) }
                { ...bind( props, 'user_type' ) }
            />
        </>
    );
}

/**
 * Banner Height, Font Family and Font Size.
 *
 * @since SPSG_VERSION
 *
 * @param props Values and handlers.
 */
export function BarTypographyFields( props: BarFieldsProps ) {
    const { values, setValue } = props;

    return (
        <>
            <NumberField
                label={ __( 'Banner Height', 'storegrowth-sales-booster' ) }
                suffix="px"
                min={ 1 }
                value={ values.banner_height }
                onChange={ ( next ) => setValue( 'banner_height', next ) }
                { ...bind( props, 'banner_height' ) }
            />
            <SelectField
                label={ __( 'Font Family', 'storegrowth-sales-booster' ) }
                value={ values.font_family }
                options={ Object.entries( BAR_FONTS ).map(
                    ( [ value, label ] ) => ( { value, label } )
                ) }
                onChange={ ( next ) => setValue( 'font_family', next ) }
                { ...bind( props, 'font_family' ) }
            />
            <NumberField
                label={ __( 'Font Size', 'storegrowth-sales-booster' ) }
                suffix="px"
                min={ 1 }
                value={ values.font_size }
                onChange={ ( next ) => setValue( 'font_size', next ) }
                { ...bind( props, 'font_size' ) }
            />
        </>
    );
}

export interface BarIconPickerProps {
    label: string;
    /** The icons, in display order: stored slug, name, lucide icon. */
    icons: Array< { value: string; label: string; Icon: LucideIcon } >;
    /** Stored slug; `''` for none. */
    value: string;
    onChange: ( value: string ) => void;
    /** Custom icon address (pro); the bar shows it while no icon is chosen. */
    custom: string;
    onCustomChange: ( value: string ) => void;
    locked?: boolean;
    error?: string;
}

interface MediaFrame {
    on: ( event: string, callback: () => void ) => void;
    open: () => void;
    state: () => {
        get: ( name: string ) => {
            first: () => { toJSON: () => { url: string } };
        };
    };
}

/**
 * Pick a custom icon from the media library.
 *
 * @param onPick Called with the chosen file's address.
 */
function openMedia( onPick: ( url: string ) => void ) {
    const media = (
        window as unknown as {
            wp?: {
                media?: ( options: Record< string, unknown > ) => MediaFrame;
            };
        }
     ).wp?.media;

    if ( ! media ) {
        return;
    }

    const frame = media( {
        title: __( 'Banner Icon', 'storegrowth-sales-booster' ),
        library: { type: 'image' },
        multiple: false,
    } );
    frame.on( 'select', () =>
        onPick( frame.state().get( 'selection' ).first().toJSON().url )
    );
    frame.open();
}

/**
 * Banner icon (design `.seg`): label on the left; the three icons in a
 * segmented pill (pressing the chosen one again clears it) and Upload on
 * the right. The uploaded icon's address shows once there is one.
 *
 * @since SPSG_VERSION
 *
 * @param props                Props.
 * @param props.label          Label.
 * @param props.icons          Slug → icon.
 * @param props.value          Chosen slug.
 * @param props.onChange       Slug handler.
 * @param props.custom         Custom icon address.
 * @param props.onCustomChange Custom icon handler.
 * @param props.locked         Pro field without pro.
 * @param props.error          Custom icon error.
 */
export function BarIconPicker( {
    label,
    icons,
    value,
    onChange,
    custom,
    onCustomChange,
    locked,
    error,
}: BarIconPickerProps ) {
    const labelId = useId();

    return (
        <div className="flex w-full flex-col gap-3">
            <div className="flex w-full flex-wrap items-center justify-between gap-3">
                <span
                    id={ labelId }
                    className={ `flex items-center gap-2 ${ FIELD_LABEL }` }
                >
                    { label }
                    { locked && <ProBadge /> }
                </span>
                <span className="flex shrink-0 items-center gap-2">
                    <ToggleGroup
                        aria-labelledby={ labelId }
                        value={ value ? [ value ] : [] }
                        onValueChange={ ( next ) =>
                            onChange( next[ 0 ] ?? '' )
                        }
                        disabled={ locked }
                        spacing={ 2 }
                        className="rounded-lg bg-sg-chip p-1"
                    >
                        { icons.map( ( icon ) => (
                            <ToggleGroupItem
                                key={ icon.value }
                                value={ icon.value }
                                aria-label={ icon.label }
                                className="size-9 p-2 text-sg-tertiary hover:bg-white/60 aria-pressed:bg-white aria-pressed:text-sg-brand aria-pressed:shadow-[0_1px_1px_rgba(0,0,0,.05),0_2px_1px_rgba(0,0,0,.05)]"
                            >
                                <icon.Icon
                                    className="size-5"
                                    strokeWidth={ 1.5 }
                                    aria-hidden
                                />
                            </ToggleGroupItem>
                        ) ) }
                    </ToggleGroup>
                    <Button
                        variant="outline"
                        disabled={ locked }
                        // An upload clears the icon, so the bar shows the upload.
                        onClick={ () =>
                            openMedia( ( url ) => {
                                onCustomChange( url );
                                onChange( '' );
                            } )
                        }
                        className="h-11 gap-2 border-sg-brand text-sg-brand"
                    >
                        <Upload className="size-4" aria-hidden />
                        { __( 'Upload', 'storegrowth-sales-booster' ) }
                    </Button>
                </span>
            </div>
            { ( custom || error ) && (
                <TextField
                    label={ __(
                        'Custom Icon URL',
                        'storegrowth-sales-booster'
                    ) }
                    value={ custom }
                    onChange={ onCustomChange }
                    placeholder="https://"
                    help={ __(
                        'Shown while none of the icons above is selected. Empty it to remove the upload.',
                        'storegrowth-sales-booster'
                    ) }
                    locked={ locked }
                    error={ error }
                />
            ) }
        </div>
    );
}
