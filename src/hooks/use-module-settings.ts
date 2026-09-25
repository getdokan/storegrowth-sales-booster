/**
 * Load, edit and save one module's settings (`sales-booster/v1/settings/{id}`).
 * Local React state: each settings page owns its copy, no global store.
 *
 * @since SPSG_VERSION
 */
import { useCallback, useEffect, useMemo, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import {
    errorMessage,
    fetchModuleSettings,
    getHeaderData,
    saveModuleSettings,
    type SettingField,
    type SettingValue,
} from '@storegrowth/utilities';

type Values = Record< string, SettingValue >;

export interface ModuleSettings< V extends Values = Values > {
    /** True until the first load finishes. */
    loading: boolean;
    /** Load error, if the settings could not be read. */
    loadError: string | null;
    schema: Partial< Record< keyof V, SettingField > >;
    /** Current (edited) values. */
    values: V;
    /**
     * Change one value (not saved). Pass the API type (a number field's
     * control emits a `number`, not the input's string), or `isDirty` sees a
     * change that isn't one.
     */
    setValue: < K extends keyof V >( key: K, value: V[ K ] ) => void;
    /** Change several values at once, e.g. a template preset (not saved). */
    setValues: ( values: Partial< V > ) => void;
    /** Any unsaved change, or in `keys` only. */
    isDirty: ( keys?: Array< keyof V > ) => boolean;
    /** Pro field while pro is inactive: shown, not editable, not saved. */
    isLocked: ( key: keyof V ) => boolean;
    /** Field → message from the last failed save. */
    errors: Partial< Record< keyof V, string > >;
    saving: boolean;
    /**
     * Save unsaved changes (all, or in `keys` only). On failure sets `errors`
     * and rethrows for the caller's toast.
     */
    save: ( keys?: Array< keyof V > ) => Promise< void >;
    /** Put fields (all, or `keys`) back to their defaults. Not saved. */
    reset: ( keys?: Array< keyof V > ) => void;
}

/**
 * @since SPSG_VERSION
 *
 * @param moduleId Module id, e.g. `stock-bar`.
 */
export function useModuleSettings< V extends Values = Values >(
    moduleId: string
): ModuleSettings< V > {
    const [ loading, setLoading ] = useState( true );
    const [ loadError, setLoadError ] = useState< string | null >( null );
    const [ schema, setSchema ] = useState<
        Partial< Record< keyof V, SettingField > >
    >( {} );
    const [ saved, setSaved ] = useState< V >( {} as V );
    const [ values, setValuesState ] = useState< V >( {} as V );
    const [ errors, setErrors ] = useState<
        Partial< Record< keyof V, string > >
    >( {} );
    const [ saving, setSaving ] = useState( false );

    const isPro = Boolean( getHeaderData().header_info.is_pro_exists );

    useEffect( () => {
        let cancelled = false;

        setLoading( true );
        fetchModuleSettings< V >( moduleId )
            .then( ( response ) => {
                if ( cancelled ) {
                    return;
                }
                setSchema( response.schema );
                setSaved( response.values );
                setValuesState( response.values );
                setLoadError( null );
            } )
            .catch( ( error ) => {
                if ( ! cancelled ) {
                    setLoadError(
                        errorMessage(
                            error,
                            __(
                                'The settings could not be loaded.',
                                'storegrowth-sales-booster'
                            )
                        )
                    );
                }
            } )
            .finally( () => ! cancelled && setLoading( false ) );

        return () => {
            cancelled = true;
        };
    }, [ moduleId ] );

    const isLocked = useCallback(
        ( key: keyof V ) => Boolean( schema[ key ]?.pro ) && ! isPro,
        [ schema, isPro ]
    );

    const setValue = useCallback(
        < K extends keyof V >( key: K, value: V[ K ] ) => {
            setValuesState( ( current ) => ( { ...current, [ key ]: value } ) );
            setErrors( ( current ) => ( { ...current, [ key ]: undefined } ) );
        },
        []
    );

    const setValues = useCallback( ( next: Partial< V > ) => {
        setValuesState( ( current ) => ( { ...current, ...next } ) );
    }, [] );

    const changedKeys = useCallback(
        ( keys?: Array< keyof V > ) =>
            ( keys ?? ( Object.keys( values ) as Array< keyof V > ) ).filter(
                ( key ) => values[ key ] !== saved[ key ] && ! isLocked( key )
            ),
        [ values, saved, isLocked ]
    );

    const isDirty = useCallback(
        ( keys?: Array< keyof V > ) => changedKeys( keys ).length > 0,
        [ changedKeys ]
    );

    const save = useCallback(
        async ( keys?: Array< keyof V > ) => {
            const changed = changedKeys( keys );

            if ( ! changed.length ) {
                return;
            }

            const payload = Object.fromEntries(
                changed.map( ( key ) => [ key, values[ key ] ] )
            ) as Partial< V >;

            setSaving( true );
            setErrors( {} );

            try {
                const response = await saveModuleSettings< V >(
                    moduleId,
                    payload
                );
                setSaved( response.values );
                // Keep unsaved edits in other keys; take the saved ones back
                // from the server (sanitized).
                setValuesState( ( current ) => ( {
                    ...current,
                    ...Object.fromEntries(
                        changed.map( ( key ) => [
                            key,
                            response.values[ key ],
                        ] )
                    ),
                } ) );
            } catch ( error ) {
                const params = ( error as { data?: { params?: unknown } } )
                    ?.data?.params;
                if ( params && typeof params === 'object' ) {
                    setErrors( params as Partial< Record< keyof V, string > > );
                }
                throw error;
            } finally {
                setSaving( false );
            }
        },
        [ changedKeys, values, moduleId ]
    );

    const reset = useCallback(
        ( keys?: Array< keyof V > ) => {
            const targets =
                keys ?? ( Object.keys( schema ) as Array< keyof V > );

            setValuesState( ( current ) => {
                const next = { ...current };
                targets.forEach( ( key ) => {
                    const field = schema[ key ];
                    if ( field && ! isLocked( key ) ) {
                        next[ key ] = field.default as V[ typeof key ];
                    }
                } );
                return next;
            } );
            setErrors( {} );
        },
        [ schema, isLocked ]
    );

    return useMemo(
        () => ( {
            loading,
            loadError,
            schema,
            values,
            setValue,
            setValues,
            isDirty,
            isLocked,
            errors,
            saving,
            save,
            reset,
        } ),
        [
            loading,
            loadError,
            schema,
            values,
            setValue,
            setValues,
            isDirty,
            isLocked,
            errors,
            saving,
            save,
            reset,
        ]
    );
}
