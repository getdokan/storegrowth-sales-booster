/**
 * Module list and status, shared by the shell, the Dashboard, the Modules page
 * and every module page. Lives in the shared `@storegrowth/hooks` bundle, so
 * module bundles get the same context instance as the shell.
 *
 * @since SPSG_VERSION
 */
import {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useState,
} from '@wordpress/element';
import type { ReactNode } from 'react';
import {
    getAdminData,
    sortModules,
    updateModuleStatus,
    updateModulesStatus,
} from '@storegrowth/utilities';

export interface ModulesContextValue {
    /** Modules in feature-menu order. */
    modules: SpsgModule[];
    /** Module ids with a status request in flight. */
    pending: string[];
    /** Find a module by id. */
    getModule: ( id: string ) => SpsgModule | undefined;
    /** Activate or deactivate one module (optimistic; reverts and rethrows on failure). */
    setModuleStatus: ( id: string, status: boolean ) => Promise< void >;
    /** Activate or deactivate every module (optimistic; reverts and rethrows on failure). */
    setAllModulesStatus: ( status: boolean ) => Promise< void >;
}

const ModulesContext = createContext< ModulesContextValue | null >( null );

/**
 * Provides the module list, seeded from the data PHP localizes.
 *
 * @since SPSG_VERSION
 *
 * @param props          Props.
 * @param props.children App.
 */
export function ModulesProvider( { children }: { children: ReactNode } ) {
    const [ modules, setModules ] = useState< SpsgModule[] >( () =>
        sortModules( getAdminData().modules )
    );
    const [ pending, setPending ] = useState< string[] >( [] );

    const applyStatus = useCallback(
        ( ids: string[], status: boolean ) =>
            setModules( ( current ) =>
                current.map( ( module ) =>
                    ids.includes( module.id ) ? { ...module, status } : module
                )
            ),
        []
    );

    const mergeFromServer = useCallback( ( updated: SpsgModule[] ) => {
        setModules( ( current ) =>
            current.map(
                ( module ) =>
                    updated.find( ( item ) => item.id === module.id ) ?? module
            )
        );
    }, [] );

    const track = useCallback( ( ids: string[], busy: boolean ) => {
        setPending( ( current ) =>
            busy
                ? [ ...current, ...ids ]
                : current.filter( ( id ) => ! ids.includes( id ) )
        );
    }, [] );

    const setModuleStatus = useCallback(
        async ( id: string, status: boolean ) => {
            const previous = modules.find( ( module ) => module.id === id );

            applyStatus( [ id ], status );
            track( [ id ], true );

            try {
                mergeFromServer( [ await updateModuleStatus( id, status ) ] );
            } catch ( error ) {
                if ( previous ) {
                    applyStatus( [ id ], previous.status );
                }
                throw error;
            } finally {
                track( [ id ], false );
            }
        },
        [ modules, applyStatus, mergeFromServer, track ]
    );

    const setAllModulesStatus = useCallback(
        async ( status: boolean ) => {
            const previous = modules;
            const ids = modules.map( ( module ) => module.id );

            applyStatus( ids, status );
            track( ids, true );

            try {
                mergeFromServer( await updateModulesStatus( ids, status ) );
            } catch ( error ) {
                setModules( previous );
                throw error;
            } finally {
                track( ids, false );
            }
        },
        [ modules, applyStatus, mergeFromServer, track ]
    );

    const value = useMemo< ModulesContextValue >(
        () => ( {
            modules,
            pending,
            getModule: ( id ) => modules.find( ( module ) => module.id === id ),
            setModuleStatus,
            setAllModulesStatus,
        } ),
        [ modules, pending, setModuleStatus, setAllModulesStatus ]
    );

    return (
        <ModulesContext.Provider value={ value }>
            { children }
        </ModulesContext.Provider>
    );
}

/**
 * The shared module list.
 *
 * @since SPSG_VERSION
 */
export function useModules(): ModulesContextValue {
    const context = useContext( ModulesContext );

    if ( ! context ) {
        throw new Error(
            'useModules() must be used inside <ModulesProvider>.'
        );
    }

    return context;
}
