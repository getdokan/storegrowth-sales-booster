/**
 * Load, edit and save one record (a BOGO offer, an order bump) for its
 * editor (ADR-010). Returns the `ModuleSettings` shape, so the generated
 * settings page (`ModuleSettingsPage`) draws the record from the editor's
 * schema as it draws a module's settings. The record is a table row, saved
 * through its REST routes (`@storegrowth/utilities` records client): a new
 * record is created with every value, then opened (`onCreated`); an existing
 * one sends only what changed (the route merges it over the stored record).
 *
 * @since SPSG_VERSION
 */
import { useCallback, useEffect, useMemo, useState } from '@wordpress/element';
import {
    errorMessage,
    fetchRecord,
    fetchRecordEditor,
    getHeaderData,
    type RecordData,
    type RecordEditorData,
    saveRecord,
    type SettingField,
    type SettingsPageDefinition,
    type SettingValue,
} from '@storegrowth/utilities';

import type { ModuleSettings } from './use-module-settings';

export type RecordValues = Record< string, SettingValue >;

type Schema = Record< string, SettingField >;
type Errors = Partial< Record< string, string > >;

/**
 * A rule the routes don't check, tested before saving: the keys it reads
 * (the first is the field it marks) and its message.
 *
 * @since SPSG_VERSION
 */
export interface RecordRule {
    keys: string[];
    broken: ( values: RecordValues ) => boolean;
    message: string;
}

/**
 * Pass module-level constants and functions (not inline ones): they are the
 * load's dependencies.
 *
 * @since SPSG_VERSION
 */
export interface RecordEditorOptions< E extends RecordEditorData > {
    /** Records route, e.g. `/sales-booster/v1/bogo/offers`. */
    route: string;
    /** Record id, or null for a new record. */
    id: number | null;
    /** Called with the new record's id after it's created. */
    onCreated: ( id: number ) => void;
    /** Rules checked before saving. */
    rules?: RecordRule[];
    /** A route's error code → the field it's about. */
    errorFields?: Record< string, string >;
    /** Message when the record or editor can't be loaded. */
    loadErrorMessage: string;
    /**
     * The schema to draw, from the editor's (e.g. options narrowed); the
     * values are read with the editor's own.
     */
    schema?: ( editor: E, values: RecordValues ) => Schema;
}

/**
 * The editor's record, with the editor route's response and the record as
 * loaded (null until loaded, or for a new record).
 *
 * @since SPSG_VERSION
 */
export interface RecordEditor< E extends RecordEditorData >
    extends ModuleSettings< RecordValues > {
    editor: E | null;
    record: RecordData | null;
}

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
 * The editor's values from a record (defaults for a new one).
 *
 * @param schema Editor schema.
 * @param record Record from the REST routes.
 */
function toValues( schema: Schema, record: RecordData = {} ): RecordValues {
    return Object.fromEntries(
        Object.entries( schema ).map( ( [ key, field ] ) => {
            return [ key, typed( field, record[ key ] ) ];
        } )
    );
}

const NO_RULES: RecordRule[] = [];
const NO_ERROR_FIELDS: Record< string, string > = {};

/**
 * @since SPSG_VERSION
 *
 * @param options Options.
 */
export function useRecordEditor< E extends RecordEditorData >(
    options: RecordEditorOptions< E >
): RecordEditor< E > {
    const {
        route,
        id,
        onCreated,
        rules = NO_RULES,
        errorFields = NO_ERROR_FIELDS,
        loadErrorMessage,
        schema: toSchema,
    } = options;
    const [ loading, setLoading ] = useState( true );
    const [ loadError, setLoadError ] = useState< string | null >( null );
    const [ schema, setSchema ] = useState< Schema >( {} );
    const [ page, setPage ] = useState< SettingsPageDefinition >( {} );
    const [ saved, setSaved ] = useState< RecordValues >( {} );
    const [ values, setValuesState ] = useState< RecordValues >( {} );
    const [ errors, setErrors ] = useState< Errors >( {} );
    const [ saving, setSaving ] = useState( false );
    const [ editor, setEditor ] = useState< E | null >( null );
    const [ record, setRecord ] = useState< RecordData | null >( null );

    const isPro = Boolean( getHeaderData().header_info.is_pro_exists );

    useEffect( () => {
        let cancelled = false;

        setLoading( true );
        Promise.all( [
            fetchRecordEditor< E >( route ),
            id ? fetchRecord( route, id ) : undefined,
        ] )
            .then( ( [ loadedEditor, loadedRecord ] ) => {
                if ( cancelled ) {
                    return;
                }

                const loaded = toValues( loadedEditor.schema, loadedRecord );

                setSchema(
                    toSchema
                        ? toSchema( loadedEditor, loaded )
                        : loadedEditor.schema
                );
                setPage( loadedEditor.page );
                setEditor( loadedEditor );
                setRecord( loadedRecord ?? null );
                setSaved( loaded );
                setValuesState( loaded );
                setLoadError( null );
            } )
            .catch( ( error ) => {
                if ( ! cancelled ) {
                    // A missing record may answer `{ error }`, not a WP_Error.
                    const missing = ( error as { error?: string } )?.error;

                    setLoadError(
                        errorMessage(
                            missing ? { message: missing } : error,
                            loadErrorMessage
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
    }, [ id, route, toSchema, loadErrorMessage ] );

    const isLocked = useCallback(
        ( key: string ) => {
            return Boolean( schema[ key ]?.pro ) && ! isPro;
        },
        [ schema, isPro ]
    );

    const setValue = useCallback(
        < K extends string >( key: K, value: RecordValues[ K ] ) => {
            setValuesState( ( current ) => {
                return { ...current, [ key ]: value };
            } );
            setErrors( ( current ) => {
                return { ...current, [ key ]: undefined };
            } );
        },
        []
    );

    const setValues = useCallback( ( next: Partial< RecordValues > ) => {
        setValuesState( ( current ) => {
            return { ...current, ...next } as RecordValues;
        } );
    }, [] );

    // A new record is all changes: its first save creates it with every
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
            // A new record sends everything; an update what changed in `keys`.
            const changed = changedKeys( id ? keys : undefined );

            if ( ! changed.length ) {
                return;
            }

            // Every rule for a new record; a rule about a changed key for
            // an update. Every broken one is marked; the toast says the first.
            const broken = rules.filter( ( rule ) => {
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
                const response = await saveRecord(
                    route,
                    id,
                    Object.fromEntries(
                        changed.map( ( key ) => {
                            return [ key, values[ key ] ];
                        } )
                    )
                );

                if ( ! id ) {
                    onCreated( Number( response.id ) );
                    return;
                }

                // The route returns the record as stored (sanitized): it is
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

                if ( errorFields[ code ] ) {
                    setErrors( {
                        [ errorFields[ code ] ]: errorMessage( error, '' ),
                    } );
                }
                throw error;
            } finally {
                setSaving( false );
            }
        },
        [
            changedKeys,
            values,
            id,
            schema,
            onCreated,
            route,
            rules,
            errorFields,
        ]
    );

    // Reset: a new record's fields go back to the defaults, an existing
    // record's to what's saved.
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
            editor,
            record,
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
        editor,
        record,
    ] );
}
