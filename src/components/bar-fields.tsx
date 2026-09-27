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
import { __ } from '@wordpress/i18n';
import type { LucideIcon } from 'lucide-react';
import type { SettingValue } from '@storegrowth/utilities';

import {
    CheckboxField,
    FieldLabel,
    MultiSelectField,
    NumberField,
    SelectField,
    TextField,
} from './fields';

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
 * Whether the bar shows at a preview width, as the storefront script
 * decides it (phones up to 768px: `banner-show-mobile`, wider:
 * `banner-show-desktop`).
 *
 * @since SPSG_VERSION
 *
 * @param devices `banner_device_view`.
 * @param device  Preview width.
 */
export function barShowsOn( devices: string[], device: string ): boolean {
    return ( devices ?? [] ).includes(
        device === 'mobile' ? 'banner-show-mobile' : 'banner-show-desktop'
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
    const devices = values.banner_device_view ?? [];
    const { locked } = bind( props, 'banner_device_view' );

    const toggle = ( device: string, on: boolean ) =>
        setValue(
            'banner_device_view',
            on
                ? [ ...devices.filter( ( item ) => item !== device ), device ]
                : devices.filter( ( item ) => item !== device )
        );

    return (
        <div className="flex w-full flex-col items-start gap-3">
            <FieldLabel locked={ locked }>{ label }</FieldLabel>
            <div className="flex w-full gap-6">
                <div>
                    <CheckboxField
                        label={ __( 'Desktop', 'storegrowth-sales-booster' ) }
                        checked={ devices.includes( 'banner-show-desktop' ) }
                        onChange={ ( on ) =>
                            toggle( 'banner-show-desktop', on )
                        }
                        locked={ locked }
                    />
                </div>
                <div>
                    <CheckboxField
                        label={ __( 'Mobile', 'storegrowth-sales-booster' ) }
                        checked={ devices.includes( 'banner-show-mobile' ) }
                        onChange={ ( on ) =>
                            toggle( 'banner-show-mobile', on )
                        }
                        locked={ locked }
                    />
                </div>
            </div>
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

    return (
        <>
            <div className="flex w-full flex-col items-start gap-3">
                <FieldLabel locked={ locked }>
                    { __( 'Trigger', 'storegrowth-sales-booster' ) }
                </FieldLabel>
                <RadioGroup
                    value={ values.banner_trigger }
                    onValueChange={ ( next ) =>
                        setValue( 'banner_trigger', next as string )
                    }
                    disabled={ locked }
                    className="grid grid-cols-2 gap-3 max-[420px]:grid-cols-1"
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
                label={ __( 'Show On', 'storegrowth-sales-booster' ) }
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
                            'Logged-in Users',
                            'storegrowth-sales-booster'
                        ),
                    },
                    {
                        value: 'not_logged_in',
                        label: __( 'Guests', 'storegrowth-sales-booster' ),
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
    /** Stored icon slug → lucide icon. */
    icons: Record< string, LucideIcon >;
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
 * Banner icon: the three stored icons (pressing the chosen one again
 * clears it) and an uploaded custom icon.
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
    return (
        <div className="flex w-full flex-col items-start gap-3">
            <FieldLabel locked={ locked }>{ label }</FieldLabel>
            <div className="flex flex-wrap items-center gap-2">
                <ToggleGroup
                    aria-label={ label }
                    value={ value ? [ value ] : [] }
                    onValueChange={ ( next ) => onChange( next[ 0 ] ?? '' ) }
                    disabled={ locked }
                    spacing={ 2 }
                >
                    { Object.entries( icons ).map( ( [ slug, Icon ] ) => (
                        <ToggleGroupItem
                            key={ slug }
                            value={ slug }
                            aria-label={ slug }
                            className="size-10 rounded-[5px] border border-sg-stroke bg-white p-2 text-sg-text hover:bg-sg-chip aria-pressed:border-sg-brand aria-pressed:bg-sg-brand aria-pressed:text-white"
                        >
                            <Icon className="size-5" aria-hidden />
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
                    className="h-10"
                >
                    { __( 'Upload', 'storegrowth-sales-booster' ) }
                </Button>
            </div>
            <TextField
                label={ __( 'Custom Icon URL', 'storegrowth-sales-booster' ) }
                value={ custom }
                onChange={ onCustomChange }
                placeholder="https://"
                help={ __(
                    'Shown while none of the icons above is selected.',
                    'storegrowth-sales-booster'
                ) }
                locked={ locked }
                error={ error }
            />
        </div>
    );
}
