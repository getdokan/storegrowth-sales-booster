/**
 * Load, edit and save one BOGO offer for the editor (ADR-010). Returns the
 * `ModuleSettings` shape, so the generated settings page (`ModuleSettingsPage`)
 * draws the offer from the editor's schema (PHP `BogoOfferFields`) as it draws
 * a module's settings. The offer is a table row, saved through the BOGO REST
 * routes: a new offer is created with every value; an existing one sends only
 * what changed (the route merges it over the stored offer).
 *
 * @since SPSG_VERSION
 */
import { useCallback, useEffect, useMemo, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import type { ModuleSettings } from '@storegrowth/hooks';
import {
    errorMessage,
    getHeaderData,
    type SettingField,
    type SettingsPageDefinition,
    type SettingValue,
} from '@storegrowth/utilities';

import {
    type Currency,
    fetchEditor,
    fetchOffer,
    type OfferData,
    saveOffer,
} from '../api';

export type OfferValues = Record< string, SettingValue >;

export interface BogoOffer extends ModuleSettings< OfferValues > {
    /** False while lite's limit stops a new offer (the server decides). */
    canCreate: boolean;
    /** The store's price format, for the preview. */
    currency: Currency;
    /** A product offer ("Specific"): its product's edit screen. */
    productEditUrl: string;
    /** The offer is a product offer ("Specific"). */
    productOffer: boolean;
    /** The global "Show Regular Price" setting, for the preview. */
    showRegularPrice: boolean;
}

type Schema = Record< string, SettingField >;
type Errors = Partial< Record< string, string > >;

/**
 * A value from the REST routes in the schema's type (numbers and flags are
 * stored as strings; a missing value is the default).
 *
 * @param field Schema.
 * @param value Raw value.
 */
function typed( field: SettingField, value: unknown ): SettingValue {
    if ( value === undefined || value === null ) {
        return field.default;
    }

    switch ( field.type ) {
        case 'toggle':
            return [ true, 1, '1', 'true', 'yes' ].includes(
                value as string | number | boolean
            );

        case 'number': {
            const number = Number( value );

            return value === '' || Number.isNaN( number )
                ? field.default
                : number;
        }

        case 'list':
            return Array.isArray( value )
                ? value.map( ( item ) => {
                      return field.item === 'int'
                          ? Number( item )
                          : String( item );
                  } )
                : field.default;

        // A DATE column; the editor's inputs take `YYYY-MM-DD`.
        case 'date':
            return String( value ).slice( 0, 10 );

        default:
            return String( value );
    }
}

/**
 * The editor's values from an offer (defaults for a new one).
 *
 * @param schema Editor schema.
 * @param offer  Offer from the REST routes.
 */
function toValues( schema: Schema, offer: OfferData = {} ): OfferValues {
    return Object.fromEntries(
        Object.entries( schema ).map( ( [ key, field ] ) => {
            return [ key, typed( field, offer[ key ] ) ];
        } )
    );
}

/**
 * Rules the routes don't check (the old editor checked them before saving),
 * each with the keys it reads; the first is the field it marks.
 */
const RULES: Array< {
    keys: string[];
    broken: ( values: OfferValues ) => boolean;
    message: string;
} > = [
    {
        keys: [ 'name_of_order_bogo' ],
        broken: ( values ) => {
            return ! String( values.name_of_order_bogo ?? '' ).trim();
        },
        message: __(
            'Enter a name for the offer.',
            'storegrowth-sales-booster'
        ),
    },
    {
        keys: [ 'offered_products' ],
        broken: ( values ) => {
            return ! ( values.offered_products as number[] )?.length;
        },
        message: __(
            'Select at least one target product.',
            'storegrowth-sales-booster'
        ),
    },
    {
        keys: [ 'get_different_product_field', 'bogo_deal_type' ],
        broken: ( values ) => {
            return (
                values.bogo_deal_type === 'different' &&
                ! values.get_different_product_field
            );
        },
        message: __( 'Select the offer product.', 'storegrowth-sales-booster' ),
    },
    {
        keys: [ 'discount_amount', 'offer_type' ],
        broken: ( values ) => {
            const amount = Number( values.discount_amount );

            return (
                values.offer_type === 'discount' &&
                ( ! ( amount > 0 ) || amount > 100 )
            );
        },
        message: __(
            'Enter a discount from 1 to 100%.',
            'storegrowth-sales-booster'
        ),
    },
    {
        keys: [ 'offer_end', 'offer_start' ],
        broken: ( values ) => {
            return Boolean(
                values.offer_start &&
                    values.offer_end &&
                    values.offer_end < values.offer_start
            );
        },
        message: __(
            'The end date is before the start date.',
            'storegrowth-sales-booster'
        ),
    },
];

/** A route's error code → the field it's about. */
const ERROR_FIELDS: Record< string, string > = {
    missing_name_of_order_bogo: 'name_of_order_bogo',
    bogo_same_product: 'get_different_product_field',
    bogo_offer_exists: 'offered_products',
    bogo_missing_target: 'offered_products',
    bogo_invalid_discount: 'discount_amount',
    bogo_invalid_dates: 'offer_end',
};

/** Until the editor loads. */
const NO_CURRENCY: Currency = {
    symbol: '',
    position: 'left',
    decimals: 2,
    decimal_separator: '.',
    thousand_separator: ',',
};

/**
 * @since SPSG_VERSION
 *
 * @param id        Offer id, or null for a new offer.
 * @param onCreated Called with the new offer's id after it's created.
 * @param vendor    The Dokan vendor's offer (`/bogo/offers/vendor`).
 */
export function useBogoOffer(
    id: number | null,
    onCreated: ( id: number ) => void,
    vendor = false
): BogoOffer {
    const [ loading, setLoading ] = useState( true );
    const [ loadError, setLoadError ] = useState< string | null >( null );
    const [ schema, setSchema ] = useState< Schema >( {} );
    const [ page, setPage ] = useState< SettingsPageDefinition >( {} );
    const [ saved, setSaved ] = useState< OfferValues >( {} );
    const [ values, setValuesState ] = useState< OfferValues >( {} );
    const [ errors, setErrors ] = useState< Errors >( {} );
    const [ saving, setSaving ] = useState( false );
    const [ canCreate, setCanCreate ] = useState( true );
    const [ currency, setCurrency ] = useState< Currency >( NO_CURRENCY );
    const [ productEditUrl, setProductEditUrl ] = useState( '' );
    const [ productOffer, setProductOffer ] = useState( false );
    const [ showRegularPrice, setShowRegularPrice ] = useState( false );

    const isPro = Boolean( getHeaderData().header_info.is_pro_exists );

    useEffect( () => {
        let cancelled = false;

        setLoading( true );
        Promise.all( [
            fetchEditor( vendor ),
            id ? fetchOffer( id, vendor ) : undefined,
        ] )
            .then( ( [ editor, offer ] ) => {
                if ( cancelled ) {
                    return;
                }

                const loaded = toValues( editor.schema, offer );
                const deal = editor.schema.bogo_deal_type;

                // A Dokan vendor chooses Buy X Get X only while the admin
                // allows it; an offer that already is one keeps it.
                const hideSame =
                    editor.buy_x_get_x === false &&
                    deal?.options &&
                    loaded.bogo_deal_type !== 'same';

                setSchema(
                    hideSame
                        ? {
                              ...editor.schema,
                              bogo_deal_type: {
                                  ...deal,
                                  options: deal.options?.filter( ( option ) => {
                                      return option !== 'same';
                                  } ),
                              },
                          }
                        : editor.schema
                );
                setPage( editor.page );
                setCanCreate( editor.can_create );
                setCurrency( editor.currency );
                setShowRegularPrice( Boolean( editor.show_regular_price ) );
                setProductEditUrl(
                    offer?.type === 'product'
                        ? String( offer.edit_url ?? '' )
                        : ''
                );
                setProductOffer( offer?.type === 'product' );
                setSaved( loaded );
                setValuesState( loaded );
                setLoadError( null );
            } )
            .catch( ( error ) => {
                if ( ! cancelled ) {
                    // A missing offer answers `{ error }`, not a WP_Error.
                    const missing = ( error as { error?: string } )?.error;

                    setLoadError(
                        errorMessage(
                            missing ? { message: missing } : error,
                            __(
                                'The offer could not be loaded.',
                                'storegrowth-sales-booster'
                            )
                        )
                    );
                }
            } )
            .finally( () => {
                if ( ! cancelled ) {
                    setLoading( false );
                }
            } );

        return () => {
            cancelled = true;
        };
    }, [ id, vendor ] );

    const isLocked = useCallback(
        ( key: string ) => {
            return Boolean( schema[ key ]?.pro ) && ! isPro;
        },
        [ schema, isPro ]
    );

    const setValue = useCallback(
        < K extends string >( key: K, value: OfferValues[ K ] ) => {
            setValuesState( ( current ) => {
                return { ...current, [ key ]: value };
            } );
            setErrors( ( current ) => {
                return { ...current, [ key ]: undefined };
            } );
        },
        []
    );

    const setValues = useCallback( ( next: Partial< OfferValues > ) => {
        setValuesState( ( current ) => {
            return { ...current, ...next } as OfferValues;
        } );
    }, [] );

    // A new offer is all changes: its first save creates it with every
    // value, from any tab.
    const changedKeys = useCallback(
        ( keys?: string[] ) => {
            return ( keys ?? Object.keys( values ) ).filter( ( key ) => {
                return (
                    ! isLocked( key ) &&
                    ( ! id ||
                        JSON.stringify( values[ key ] ) !==
                            JSON.stringify( saved[ key ] ) )
                );
            } );
        },
        [ values, saved, isLocked, id ]
    );

    const isDirty = useCallback(
        ( keys?: string[] ) => {
            return changedKeys( keys ).length > 0;
        },
        [ changedKeys ]
    );

    const save = useCallback(
        async ( keys?: string[] ) => {
            // A new offer sends everything; an update what changed in `keys`.
            const changed = changedKeys( id ? keys : undefined );

            if ( ! changed.length ) {
                return;
            }

            // Every rule for a new offer; a rule about a changed key for
            // an update. Every broken one is marked; the toast says the first.
            const broken = RULES.filter( ( rule ) => {
                return (
                    ( ! id ||
                        rule.keys.some( ( key ) => {
                            return changed.includes( key );
                        } ) ) &&
                    rule.broken( values )
                );
            } );

            if ( broken.length ) {
                setErrors(
                    Object.fromEntries(
                        broken.map( ( rule ) => {
                            return [ rule.keys[ 0 ], rule.message ];
                        } )
                    )
                );
                throw new Error( broken[ 0 ].message );
            }

            setSaving( true );
            setErrors( {} );

            try {
                const response = await saveOffer(
                    id,
                    Object.fromEntries(
                        changed.map( ( key ) => {
                            return [ key, values[ key ] ];
                        } )
                    ),
                    vendor
                );

                if ( ! id ) {
                    onCreated( Number( response.id ) );
                    return;
                }

                // The route returns the offer as stored (sanitized): it is
                // what's saved now. Unsaved edits in other keys stay.
                const stored = toValues( schema, response );
                setSaved( stored );
                setValuesState( ( current ) => {
                    return {
                        ...current,
                        ...Object.fromEntries(
                            changed.map( ( key ) => {
                                return [ key, stored[ key ] ];
                            } )
                        ),
                    };
                } );
            } catch ( error ) {
                const code = ( error as { code?: string } )?.code ?? '';

                if ( ERROR_FIELDS[ code ] ) {
                    setErrors( {
                        [ ERROR_FIELDS[ code ] ]: errorMessage( error, '' ),
                    } );
                }
                throw error;
            } finally {
                setSaving( false );
            }
        },
        [ changedKeys, values, id, schema, onCreated, vendor ]
    );

    // Reset: a new offer's fields go back to the defaults, an existing
    // offer's to what's saved.
    const reset = useCallback(
        ( keys?: string[] ) => {
            setValuesState( ( current ) => {
                const next = { ...current };

                ( keys ?? Object.keys( schema ) ).forEach( ( key ) => {
                    if ( schema[ key ] && ! isLocked( key ) ) {
                        next[ key ] = id ? saved[ key ] : schema[ key ].default;
                    }
                } );

                return next;
            } );
            setErrors( {} );
        },
        [ schema, saved, isLocked, id ]
    );

    return useMemo( () => {
        return {
            loading,
            loadError,
            schema,
            page,
            values,
            setValue,
            setValues,
            isDirty,
            isLocked,
            errors,
            saving,
            published: true,
            save,
            reset,
            canCreate,
            currency,
            productEditUrl,
            productOffer,
            showRegularPrice,
        };
    }, [
        loading,
        loadError,
        schema,
        page,
        values,
        setValue,
        setValues,
        isDirty,
        isLocked,
        errors,
        saving,
        save,
        reset,
        canCreate,
        currency,
        productEditUrl,
        productOffer,
        showRegularPrice,
    ] );
}
