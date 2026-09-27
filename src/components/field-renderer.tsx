/**
 * Fields extensions (pro) add to a tab of a module's settings page
 * (ADR-007): plugin-ui settings elements and field hooks, drawn with this
 * plugin's own controls so they match the page.
 *
 * An extension appends a field in PHP (`spsg_settings_schema`) with a
 * `tab`; the page draws every such field of the tab above its Save bar and
 * saves the keys with the tab (`extensionKeys()`). Each field is a plugin-ui
 * `SettingsElement` passed through the filter
 * `storegrowth_settings_{variant}_field` ( defaultField, element ), so a
 * custom control is a variant:
 *
 *     addFilter(
 *         'storegrowth_settings_my_animation_picker_field',
 *         'my-plugin/animation-picker',
 *         ( defaultField, element ) => (
 *             <AnimationPicker
 *                 element={ element }
 *                 onChange={ defaultField.props.onChange } // ( key, value )
 *             />
 *         )
 *     );
 *
 * @since SPSG_VERSION
 */
import type { SettingsElement } from '@wedevs/plugin-ui';
import { applyFilters } from '@wordpress/hooks';
import { __, sprintf } from '@wordpress/i18n';
import type { ModuleSettings } from '@storegrowth/hooks';
import type {
    ListValue,
    SettingField,
    SettingValue,
} from '@storegrowth/utilities';

import {
    ColorField,
    MultiSelectField,
    NumberField,
    SelectField,
    SwitchField,
    TextField,
    TextareaField,
} from './fields';

type Values = Record< string, SettingValue >;

/** Control for each setting type when the field names no `variant`. */
const VARIANTS: Record< SettingField[ 'type' ], string > = {
    text: 'text',
    url: 'url',
    date: 'date',
    textarea: 'textarea',
    number: 'number',
    toggle: 'switch',
    color: 'color_picker',
    select: 'select',
    list: 'multicheck',
    // No built-in control: the extension registers a variant.
    box: 'box',
};

/**
 * Keys of the fields extensions add to a tab, in drawing order.
 *
 * @since SPSG_VERSION
 *
 * @param schema Module schema.
 * @param tab    Tab id, e.g. `configure`.
 */
export function extensionKeys< K extends string >(
    schema: Partial< Record< K, SettingField > >,
    tab: string
): K[] {
    return ( Object.keys( schema ) as K[] )
        .filter( ( key ) => schema[ key ]?.tab === tab )
        .sort(
            ( a, b ) =>
                ( schema[ a ]?.priority ?? 10 ) -
                ( schema[ b ]?.priority ?? 10 )
        );
}

/**
 * A field as a plugin-ui settings element.
 *
 * @param key      Setting key.
 * @param field    Its schema.
 * @param settings Module settings.
 */
function toElement< V extends Values >(
    key: keyof V & string,
    field: SettingField,
    settings: ModuleSettings< V >
): SettingsElement {
    const locked = settings.isLocked( key );

    return {
        id: key,
        type: 'field',
        variant: field.variant ?? VARIANTS[ field.type ],
        label: field.label ?? key,
        description: field.help,
        value: settings.values[ key ] as SettingsElement[ 'value' ],
        default: field.default as SettingsElement[ 'default' ],
        options: field.options?.map( ( value ) => ( {
            value,
            label: field.labels?.[ value ] ?? value,
        } ) ),
        placeholder: field.placeholder,
        prefix: field.prefix,
        postfix: field.suffix,
        min: field.min,
        max: field.max,
        increment: field.step,
        disabled: locked,
        badge: locked ? __( 'Pro', 'storegrowth-sales-booster' ) : undefined,
        validationError: settings.errors[ key ],
    };
}

/**
 * A control's value in the settings API type, so the page's dirty check
 * compares like with like.
 *
 * @param field Schema.
 * @param value Control value.
 *
 * @return The value, or `undefined` to ignore it (an emptied number).
 */
function coerce(
    field: SettingField,
    value: unknown
): SettingValue | undefined {
    switch ( field.type ) {
        case 'number':
            if ( value === '' || value === null || value === undefined ) {
                return field.allow_empty ? '' : undefined;
            }
            return Number( value );

        case 'toggle':
            return Boolean( value );

        case 'list':
            return ( ( value as ListValue ) ?? [] ).map( ( item ) =>
                field.item === 'int' ? Number( item ) : item
            );

        default:
            return value as SettingValue;
    }
}

export interface DefaultFieldProps {
    element: SettingsElement;
    /** plugin-ui's field `onChange`: ( key, value ). */
    onChange: ( key: string, value: unknown ) => void;
}

/**
 * The control for a built-in variant (the `defaultField` extensions get).
 *
 * @since SPSG_VERSION
 *
 * @param props          Props.
 * @param props.element  Settings element.
 * @param props.onChange Change handler.
 */
export function DefaultField( { element, onChange }: DefaultFieldProps ) {
    const change = ( value: unknown ) => onChange( element.id, value );
    const common = {
        label: element.label,
        help: element.description,
        locked: element.disabled,
        error: element.validationError,
    };
    const value = element.value ?? element.default;
    const options = ( element.options ?? [] ).map( ( option ) => ( {
        value: String( option.value ),
        label: option.label ?? String( option.value ),
    } ) );

    switch ( element.variant ) {
        case 'text':
        case 'url':
        case 'date':
            return (
                <TextField
                    { ...common }
                    type={ element.variant }
                    value={ String( value ?? '' ) }
                    placeholder={ element.placeholder as string | undefined }
                    onChange={ change }
                />
            );

        case 'textarea':
            return (
                <TextareaField
                    { ...common }
                    value={ String( value ?? '' ) }
                    placeholder={ element.placeholder as string | undefined }
                    onChange={ change }
                />
            );

        case 'number':
            return (
                <NumberField
                    { ...common }
                    allowEmpty
                    value={ value as number | '' }
                    prefix={ element.prefix }
                    suffix={ element.postfix }
                    min={ element.min }
                    max={ element.max }
                    step={ element.increment }
                    onChange={ change }
                />
            );

        case 'switch':
            return (
                <SwitchField
                    { ...common }
                    checked={ Boolean( value ) }
                    onChange={ change }
                />
            );

        case 'color_picker':
            return (
                <ColorField
                    { ...common }
                    value={ String( value ?? '' ) }
                    onChange={ change }
                />
            );

        case 'select':
            return (
                <SelectField
                    { ...common }
                    value={ String( value ?? '' ) }
                    options={ options }
                    onChange={ change }
                />
            );

        case 'multicheck':
            return (
                <MultiSelectField
                    { ...common }
                    value={ ( value as ListValue ) ?? [] }
                    options={ options }
                    onChange={ change }
                />
            );

        default:
            return (
                <p className="text-sm text-destructive">
                    { sprintf(
                        /* translators: %s: control name */
                        __(
                            'No control is registered for "%s".',
                            'storegrowth-sales-booster'
                        ),
                        String( element.variant )
                    ) }
                </p>
            );
    }
}

export interface FieldRendererProps< V extends Values > {
    /** Tab id, e.g. `configure`. */
    tab: string;
    /** The page's `useModuleSettings()`. */
    settings: ModuleSettings< V >;
}

/**
 * @since SPSG_VERSION
 *
 * @param props          Props.
 * @param props.tab      Tab id.
 * @param props.settings Module settings.
 */
export function FieldRenderer< V extends Values >( {
    tab,
    settings,
}: FieldRendererProps< V > ) {
    const keys = extensionKeys(
        settings.schema as Partial< Record< keyof V & string, SettingField > >,
        tab
    );

    const change = ( key: string, value: unknown ) => {
        const field = settings.schema[ key ];
        const next = field && coerce( field, value );

        // Only a real change goes to the page.
        if (
            next !== undefined &&
            JSON.stringify( next ) !== JSON.stringify( settings.values[ key ] )
        ) {
            settings.setValue( key, next as V[ keyof V ] );
        }
    };

    return (
        <>
            { keys.map( ( key ) => {
                const element = toElement(
                    key,
                    settings.schema[ key ] as SettingField,
                    settings
                );
                const control = applyFilters(
                    /**
                     * Filters the control of an extension field, by variant
                     * (plugin-ui's settings field hook).
                     *
                     * @since SPSG_VERSION
                     *
                     * @param {JSX.Element}     defaultField The built-in control; its `onChange( key, value )` prop saves.
                     * @param {SettingsElement} element      The field.
                     */
                    `storegrowth_settings_${ element.variant }_field`,
                    <DefaultField element={ element } onChange={ change } />,
                    element
                ) as JSX.Element;

                return (
                    <div key={ key } className="w-full">
                        { control }
                    </div>
                );
            } ) }
        </>
    );
}
