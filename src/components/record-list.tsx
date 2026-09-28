/**
 * A module's record list (BOGO offers, order bumps) over plugin-ui
 * DataViews: the Name column, the module's columns, a Status switch, the
 * module's row actions and Delete (bulk too), with search, pagination and an
 * empty state, read through the shared records client (`fetchRecords`, the
 * route's `X-WP-Total` and `X-SPSG-Can-Create` headers).
 *
 * With a `title` it is one card (the title on top, the table below, as the
 * settings pages); without one the card is the table alone, for a host that
 * draws the heading (the Dokan vendor dashboard).
 *
 * @since SPSG_VERSION
 */
import {
    DataViews,
    type DataViewAction,
    type DataViewField,
    type DataViewsProps,
    type DataViewState,
    Switch,
    toast,
} from '@wedevs/plugin-ui';
import { SlotFillProvider } from '@wordpress/components';
import { useCallback, useEffect, useRef, useState } from '@wordpress/element';
import { decodeEntities } from '@wordpress/html-entities';
import { __ } from '@wordpress/i18n';
import { type LucideIcon, Trash2 } from 'lucide-react';
import type { ReactElement, ReactNode } from 'react';
import {
    deleteRecords,
    errorMessage,
    fetchRecords,
    type RecordPage,
    setRecordStatus,
} from '@storegrowth/utilities';

import { CardHead } from './card-head';

/** What every listed record has. */
export interface ListRecord {
    id: number;
    name: string;
    status: 'active' | 'inactive';
}

/** The list's module-worded texts. */
export interface RecordListMessages {
    /** The list couldn't be loaded. */
    loadError: string;
    /** Delete confirmation title and message. */
    deleteTitle: string;
    deleteMessage: string;
    /** Some of the records weren't deleted. */
    deletePartial: string;
    /** The delete request failed. */
    deleteFailed: string;
    /** The search input's accessible name. */
    searchLabel: string;
    /** No record matches the search. */
    noResults: string;
}

export interface RecordListProps< T extends ListRecord > {
    /** Records route, e.g. `/sales-booster/v1/bogo/offers`. */
    route: string;
    /** DataViews namespace (keys its stored view). */
    namespace: string;
    /** Card title; without it the card is the table alone. */
    title?: string;
    /** Beside the title, given whether another record can be created. */
    headerActions?: ( canCreate: boolean ) => ReactNode;
    /** Columns between Name and Status. */
    fields: DataViewField< T >[];
    /** Row actions before Delete, e.g. Edit. */
    actions?: DataViewAction< T >[];
    /** The records' icon (empty states, the limit notice). */
    icon: LucideIcon;
    /** No records at all, given whether one can be created. */
    empty: ( canCreate: boolean ) => ReactElement;
    /** Above a card without a title while lite's limit stops a new record. */
    limitNotice?: string;
    /** Called with whether another record can be created. */
    onCanCreate?: ( canCreate: boolean ) => void;
    /** The status switch's accessible name for a record. */
    statusLabel: ( item: T ) => string;
    messages: RecordListMessages;
}

/**
 * @since SPSG_VERSION
 *
 * @param props               Props.
 * @param props.route         Records route.
 * @param props.namespace     DataViews namespace.
 * @param props.title         Card title.
 * @param props.headerActions Beside the title.
 * @param props.fields        Module columns.
 * @param props.actions       Row actions before Delete.
 * @param props.icon          The records' icon.
 * @param props.empty         No records at all.
 * @param props.limitNotice   Above the card at lite's limit.
 * @param props.onCanCreate   Called with whether a record can be created.
 * @param props.statusLabel   The status switch's accessible name.
 * @param props.messages      Module-worded texts.
 */
export function RecordList< T extends ListRecord >( {
    route,
    namespace,
    title,
    headerActions,
    fields,
    actions = [],
    icon: Icon,
    empty,
    limitNotice,
    onCanCreate,
    statusLabel,
    messages,
}: RecordListProps< T > ) {
    const [ view, setView ] = useState< DataViewState >( () => {
        return {
            type: 'table',
            page: 1,
            perPage: 10,
            search: '',
            // `status` is plugin-ui's tab key, so the column is `active`.
            fields: [
                ...fields.map( ( field ) => {
                    return field.id;
                } ),
                'active',
            ],
            titleField: 'name',
            layout: {},
        };
    } );
    const [ page, setPage ] = useState< RecordPage< T > | null >( null );
    const [ loading, setLoading ] = useState( true );
    // Status switches waiting for the server.
    const [ pending, setPending ] = useState< number[] >( [] );
    // Ticked rows (ids) for bulk delete.
    const [ selection, setSelection ] = useState< string[] >( [] );
    // The latest request: an older, slower one doesn't overwrite it.
    const latest = useRef( 0 );

    // The host's own "create" button (Dokan's header) follows the limit.
    useEffect( () => {
        if ( page ) {
            onCanCreate?.( page.canCreate );
        }
    }, [ page, onCanCreate ] );

    const load = useCallback( async () => {
        const request = ++latest.current;
        setLoading( true );
        try {
            const next = await fetchRecords< T >( route, {
                page: view.page ?? 1,
                per_page: view.perPage ?? 10,
                search: view.search || undefined,
            } );

            if ( request !== latest.current ) {
                return;
            }

            // Past the last page (e.g. after deleting its rows): go back.
            if ( next.totalPages > 0 && ( view.page ?? 1 ) > next.totalPages ) {
                setView( { ...view, page: next.totalPages } );
                return;
            }

            setPage( next );
        } catch ( error ) {
            toast.error( errorMessage( error, messages.loadError ) );
        } finally {
            if ( request === latest.current ) {
                setLoading( false );
            }
        }
    }, [ route, view, messages.loadError ] );

    useEffect( () => {
        load();
    }, [ load ] );

    const toggle = async ( item: T, active: boolean ) => {
        setPending( ( ids ) => {
            return [ ...ids, item.id ];
        } );
        try {
            await setRecordStatus( route, item.id, active );
            setPage( ( current ) => {
                return current
                    ? {
                          ...current,
                          items: current.items.map( ( row ) => {
                              return row.id === item.id
                                  ? {
                                        ...row,
                                        status: active ? 'active' : 'inactive',
                                    }
                                  : row;
                          } ),
                      }
                    : current;
            } );
        } catch ( error ) {
            toast.error(
                errorMessage(
                    error,
                    __(
                        'The status could not be changed.',
                        'storegrowth-sales-booster'
                    )
                )
            );
        } finally {
            setPending( ( ids ) => {
                return ids.filter( ( id ) => {
                    return id !== item.id;
                } );
            } );
        }
    };

    const allFields: DataViewField< T >[] = [
        {
            id: 'name',
            label: __( 'Name', 'storegrowth-sales-booster' ),
            enableHiding: false,
            enableSorting: false,
            getValue: ( { item } ) => {
                return decodeEntities( item.name );
            },
            render: ( { item } ) => {
                return (
                    // Two lines at most, so a long name can't push the
                    // other columns out of the card.
                    <span
                        className="line-clamp-2 max-w-[260px] whitespace-normal font-semibold leading-snug text-sg-heading"
                        title={ decodeEntities( item.name ) }
                    >
                        { decodeEntities( item.name ) }
                    </span>
                );
            },
        },
        ...fields,
        {
            id: 'active',
            label: __( 'Status', 'storegrowth-sales-booster' ),
            enableHiding: false,
            enableSorting: false,
            render: ( { item } ) => {
                return (
                    // Above the list layout's row button (narrow screens),
                    // which would take its clicks; the table layout keeps it
                    // under the sticky Actions column.
                    <span className="inline-flex [.dataviews-view-list_&]:relative [.dataviews-view-list_&]:z-[1]">
                        <Switch
                            checked={ item.status === 'active' }
                            disabled={ pending.includes( item.id ) }
                            onCheckedChange={ ( checked ) => {
                                toggle( item, checked );
                            } }
                            aria-label={ statusLabel( item ) }
                        />
                    </span>
                );
            },
        },
    ];

    const allActions: DataViewAction< T >[] = [
        ...actions,
        {
            id: 'delete',
            label: __( 'Delete', 'storegrowth-sales-booster' ),
            icon: <Trash2 size={ 16 } />,
            isDestructive: true,
            supportsBulk: true,
            confirmTitle: messages.deleteTitle,
            confirmMessage: messages.deleteMessage,
            callback: async ( items ) => {
                try {
                    const result = await deleteRecords(
                        route,
                        items.map( ( item ) => {
                            return item.id;
                        } )
                    );
                    if ( result.failed.length ) {
                        toast.error( messages.deletePartial );
                    } else {
                        toast.success(
                            __( 'Deleted.', 'storegrowth-sales-booster' )
                        );
                    }
                } catch ( error ) {
                    toast.error( errorMessage( error, messages.deleteFailed ) );
                }
                setSelection( [] );
                load();
            },
        },
    ];

    const canCreate = page?.canCreate ?? true;

    // A numeric `id` makes plugin-ui require `getItemId`, a conditional
    // type TypeScript can't resolve for a generic `T`; the props set below
    // are still checked.
    const itemId = {
        getItemId: ( item: T ) => {
            return String( item.id );
        },
    } as unknown as DataViewsProps< T >;

    const table = (
        <SlotFillProvider>
            <DataViews< T >
                { ...itemId }
                namespace={ namespace }
                data={ page?.items ?? [] }
                fields={ allFields }
                view={ view }
                onChangeView={ ( next ) => {
                    // Another page or search: its rows aren't ticked.
                    setSelection( [] );
                    setView( next );
                } }
                selection={ selection }
                onChangeSelection={ setSelection }
                actions={ allActions }
                isLoading={ loading }
                search
                searchLabel={ messages.searchLabel }
                searchPlaceholder={ __(
                    'Search',
                    'storegrowth-sales-booster'
                ) }
                paginationInfo={ {
                    totalItems: page?.totalItems ?? 0,
                    totalPages: page?.totalPages ?? 0,
                } }
                empty={ view.search ? undefined : empty( canCreate ) }
                emptyIcon={ <Icon className="size-10" aria-hidden /> }
                emptyTitle={ messages.noResults }
                emptyDescription={ __(
                    'Try another name.',
                    'storegrowth-sales-booster'
                ) }
            />
        </SlotFillProvider>
    );

    if ( ! title ) {
        return (
            <div className="flex w-full flex-col gap-4">
                { limitNotice && ! canCreate && (
                    <p
                        role="status"
                        className="m-0 flex items-center gap-2 rounded-lg border border-sg-cardline bg-white px-4 py-3 text-sm text-sg-text"
                    >
                        <Icon
                            className="size-4 shrink-0 text-sg-help"
                            aria-hidden
                        />
                        { limitNotice }
                    </p>
                ) }
                <div className="w-full overflow-hidden rounded-lg border border-sg-cardline bg-white *:border-none!">
                    { table }
                </div>
            </div>
        );
    }

    return (
        <div className="flex w-full flex-col">
            <CardHead
                title={ title }
                className="rounded-b-none"
                actions={ headerActions?.( canCreate ) }
            />
            <div className="w-full overflow-hidden rounded-b-lg border border-t-0 border-sg-cardline bg-white *:rounded-t-none! *:border-none!">
                { table }
            </div>
        </div>
    );
}
