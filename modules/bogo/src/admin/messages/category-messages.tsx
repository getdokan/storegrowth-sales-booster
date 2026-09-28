/**
 * BOGO category messages (`#/bogo/messages`, R2): the message pro shows on
 * a product category page, one per category. No design; it follows the
 * offer list (one card, DataViews). Changes need pro (the server says 403
 * too); without pro the page lists what's stored, locked.
 *
 * Every write rewrites the whole stored option, so the page sends one at a
 * time: while one is pending the switches and row actions wait, and a bulk
 * delete goes one message after another.
 *
 * @since SPSG_VERSION
 */
import {
    Button,
    DataViews,
    type DataViewAction,
    type DataViewField,
    type DataViewState,
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    Switch,
    toast,
} from '@wedevs/plugin-ui';
import { SlotFillProvider } from '@wordpress/components';
import { useCallback, useEffect, useId, useState } from '@wordpress/element';
import { decodeEntities } from '@wordpress/html-entities';
import { __, sprintf } from '@wordpress/i18n';
import { MessageSquareText, Pencil, Plus, Trash2 } from 'lucide-react';
import {
    CardHead,
    FeatureLayout,
    ProBadge,
    SelectField,
    StatusPill,
    TextareaField,
} from '@storegrowth/components';
import { Navigate, useModules, useNavigate } from '@storegrowth/hooks';
import { errorMessage, getHeaderData } from '@storegrowth/utilities';

import {
    type CategoryMessage,
    deleteCategoryMessage,
    fetchCategoryMessages,
    fetchProductCategories,
    saveCategoryMessage,
    setCategoryMessageStatus,
} from '../api';

const DEFAULT_VIEW: DataViewState = {
    type: 'table',
    page: 1,
    perPage: 10,
    search: '',
    fields: [ 'message', 'active' ],
    titleField: 'name',
    layout: {},
};

// The old screen's default text.
const DEFAULT_MESSAGE = __(
    'Buy 1, unit of any product from this category and get 1 unit free of the same product',
    'storegrowth-sales-booster'
);

const DELETED_CATEGORY = __(
    '(Deleted category)',
    'storegrowth-sales-booster'
);

// Route errors that belong to a dialog field.
const FIELD_ERRORS: Record< string, 'category' | 'message' > = {
    bogo_invalid_category: 'category',
    bogo_category_message_exists: 'category',
    rest_invalid_param: 'message',
};

/** The message being added (`id` null) or edited, in the dialog. */
interface Draft {
    id: number | null;
    category: string;
    message: string;
}

type DraftErrors = Partial< Record< 'category' | 'message', string > >;

/**
 * A message's category name, or that it was deleted.
 *
 * @param item Message.
 */
function categoryName( item: CategoryMessage ) {
    return item.name ?? DELETED_CATEGORY;
}

export default function CategoryMessages() {
    const navigate = useNavigate();
    const { getModule } = useModules();
    // Its REST routes load only while the module is on.
    const isOn = Boolean( getModule( 'bogo' )?.status );
    const isPro = Boolean( getHeaderData().header_info.is_pro_exists );
    const [ messages, setMessages ] = useState< CategoryMessage[] >( [] );
    const [ loading, setLoading ] = useState( true );
    const [ view, setView ] = useState< DataViewState >( DEFAULT_VIEW );
    const [ selection, setSelection ] = useState< string[] >( [] );
    // A switch or delete waiting for the server (one write at a time).
    const [ busy, setBusy ] = useState( false );
    const [ categories, setCategories ] = useState<
        Array< { value: string; label: string } >
    >( [] );
    const [ draft, setDraft ] = useState< Draft | null >( null );
    const [ saving, setSaving ] = useState( false );
    const [ errors, setErrors ] = useState< DraftErrors >( {} );
    const categoryId = useId();
    const messageId = useId();

    const load = useCallback( async () => {
        if ( ! isOn ) {
            return;
        }

        setLoading( true );
        try {
            setMessages( await fetchCategoryMessages() );
        } catch ( error ) {
            toast.error(
                errorMessage(
                    error,
                    __(
                        'The messages could not be loaded.',
                        'storegrowth-sales-booster'
                    )
                )
            );
        } finally {
            setLoading( false );
        }
    }, [ isOn ] );

    useEffect( () => {
        load();
    }, [ load ] );

    const perPage = view.perPage ?? 10;
    const lastPage = Math.max( 1, Math.ceil( messages.length / perPage ) );
    // Past the last page (after deleting its rows): its last page.
    const page = Math.min( view.page ?? 1, lastPage );

    // The category picker's options (only pro can add or edit).
    useEffect( () => {
        if ( ! isOn || ! isPro ) {
            return;
        }

        fetchProductCategories()
            .then( setCategories )
            .catch( ( error ) => {
                toast.error(
                    errorMessage(
                        error,
                        __(
                            'The categories could not be loaded.',
                            'storegrowth-sales-booster'
                        )
                    )
                );
            } );
    }, [ isOn, isPro ] );

    const toggle = async ( item: CategoryMessage, active: boolean ) => {
        setBusy( true );
        try {
            const saved = await setCategoryMessageStatus( item.id, active );
            setMessages( ( current ) => {
                return current.map( ( row ) => {
                    return row.id === item.id ? saved : row;
                } );
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
            setBusy( false );
        }
    };

    const focusField = ( field: keyof DraftErrors ) => {
        window.requestAnimationFrame( () => {
            document
                .getElementById( field === 'category' ? categoryId : messageId )
                ?.focus();
        } );
    };

    const showErrors = ( next: DraftErrors ) => {
        setErrors( next );

        const first = ( [ 'category', 'message' ] as const ).find(
            ( field ) => {
                return next[ field ];
            }
        );
        if ( first ) {
            focusField( first );
        }
    };

    const save = async () => {
        if ( ! draft || saving ) {
            return;
        }

        const next: DraftErrors = {};
        if ( ! draft.category ) {
            next.category = __(
                'Choose a category.',
                'storegrowth-sales-booster'
            );
        }
        if ( ! draft.message.trim() ) {
            next.message = __(
                'Enter a message.',
                'storegrowth-sales-booster'
            );
        }
        showErrors( next );
        if ( Object.keys( next ).length ) {
            return;
        }

        setSaving( true );
        try {
            await saveCategoryMessage( draft.id, {
                category: Number( draft.category ),
                message: draft.message,
            } );
            toast.success( __( 'Saved.', 'storegrowth-sales-booster' ) );
            setDraft( null );
            load();
        } catch ( error ) {
            const message = errorMessage(
                error,
                __(
                    'The message could not be saved.',
                    'storegrowth-sales-booster'
                )
            );
            const field =
                FIELD_ERRORS[ ( error as { code?: string } )?.code ?? '' ];

            if ( field ) {
                showErrors( { [ field ]: message } );
            } else {
                toast.error( message );
            }
        } finally {
            setSaving( false );
        }
    };

    const open = ( next: Draft ) => {
        setErrors( {} );
        setDraft( next );
    };

    const change = ( key: keyof DraftErrors, value: string ) => {
        setDraft( ( current ) => {
            return current ? { ...current, [ key ]: value } : current;
        } );
        setErrors( ( current ) => {
            return { ...current, [ key ]: undefined };
        } );
    };

    const fields: DataViewField< CategoryMessage >[] = [
        {
            id: 'name',
            label: __( 'Category', 'storegrowth-sales-booster' ),
            enableHiding: false,
            enableSorting: false,
            getValue: ( { item } ) => {
                return categoryName( item );
            },
            render: ( { item } ) => {
                return item.name ? (
                    <span className="font-semibold text-sg-heading">
                        { item.name }
                    </span>
                ) : (
                    <span className="italic text-sg-help">
                        { DELETED_CATEGORY }
                    </span>
                );
            },
        },
        {
            id: 'message',
            label: __( 'Message', 'storegrowth-sales-booster' ),
            enableHiding: false,
            enableSorting: false,
            render: ( { item } ) => {
                return (
                    <span className="block min-w-[320px] max-w-[520px] whitespace-normal text-sm text-sg-text">
                        { decodeEntities( item.message ) }
                    </span>
                );
            },
        },
        {
            id: 'active',
            label: __( 'Status', 'storegrowth-sales-booster' ),
            enableHiding: false,
            enableSorting: false,
            render: ( { item } ) => {
                // Locked without pro: the status, not a switch.
                if ( ! isPro ) {
                    return <StatusPill active={ item.status } />;
                }

                return (
                    <Switch
                        checked={ item.status }
                        disabled={ busy }
                        onCheckedChange={ ( checked ) => {
                            toggle( item, checked );
                        } }
                        aria-label={ sprintf(
                            /* translators: %s: category name. */
                            __(
                                'Message status: %s',
                                'storegrowth-sales-booster'
                            ),
                            categoryName( item )
                        ) }
                    />
                );
            },
        },
    ];

    const actions: DataViewAction< CategoryMessage >[] = [
        {
            id: 'edit',
            label: __( 'Edit', 'storegrowth-sales-booster' ),
            icon: <Pencil size={ 16 } />,
            isEligible: () => {
                return ! busy;
            },
            callback: ( [ item ] ) => {
                open( {
                    id: item.id,
                    category: String( item.id ),
                    message: decodeEntities( item.message ),
                } );
            },
        },
        {
            id: 'delete',
            label: __( 'Delete', 'storegrowth-sales-booster' ),
            icon: <Trash2 size={ 16 } />,
            isDestructive: true,
            supportsBulk: true,
            isEligible: () => {
                return ! busy;
            },
            confirmTitle: __( 'Delete messages?', 'storegrowth-sales-booster' ),
            confirmMessage: __(
                'The selected category messages will be deleted. This cannot be undone.',
                'storegrowth-sales-booster'
            ),
            callback: async ( items ) => {
                setBusy( true );

                // One after another: each delete rewrites the option.
                let failed = 0;
                for ( const item of items ) {
                    try {
                        await deleteCategoryMessage( item.id );
                    } catch {
                        failed++;
                    }
                }

                if ( failed ) {
                    toast.error(
                        sprintf(
                            /* translators: %d: number of messages. */
                            __(
                                '%d messages could not be deleted.',
                                'storegrowth-sales-booster'
                            ),
                            failed
                        )
                    );
                } else {
                    toast.success(
                        __( 'Deleted.', 'storegrowth-sales-booster' )
                    );
                }
                setBusy( false );
                setSelection( [] );
                load();
            },
        },
    ];

    const addNew = (
        <Button
            onClick={ () => {
                open( { id: null, category: '', message: DEFAULT_MESSAGE } );
            } }
            disabled={ ! isPro }
            className="gap-2"
        >
            <Plus className="size-4" aria-hidden />
            { __( 'Add Message', 'storegrowth-sales-booster' ) }
        </Button>
    );

    const headerActions = (
        <span className="flex flex-wrap items-center gap-3">
            <Button
                variant="outline"
                onClick={ () => {
                    navigate( '/bogo' );
                } }
            >
                { __( 'BOGO List', 'storegrowth-sales-booster' ) }
            </Button>
            { addNew }
        </span>
    );

    // Without pro: what the messages do and where to get them.
    const upgrade = ! isPro && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-sg-cardline px-6 py-4">
            <span className="flex items-center gap-2">
                <ProBadge />
                <span className="text-sm text-sg-text">
                    { __(
                        'Show a BOGO message on a product category page. Category messages are a Pro feature.',
                        'storegrowth-sales-booster'
                    ) }
                </span>
            </span>
            <Button
                onClick={ () => {
                    window.open(
                        getHeaderData().header_info.upgrade_url,
                        '_blank',
                        'noopener,noreferrer'
                    );
                } }
            >
                { __( 'Upgrade to Pro', 'storegrowth-sales-booster' ) }
            </Button>
        </div>
    );

    // A category takes one message: the picker leaves out the others'.
    const options = categories.filter( ( option ) => {
        return ! messages.some( ( item ) => {
            return String( item.id ) === option.value && item.id !== draft?.id;
        } );
    } );

    // The message of a deleted category keeps its id as the choice.
    if (
        draft?.id &&
        ! options.some( ( option ) => {
            return option.value === draft.category;
        } )
    ) {
        options.unshift( { value: draft.category, label: DELETED_CATEGORY } );
    }

    const title = draft?.id
        ? __( 'Edit Category Message', 'storegrowth-sales-booster' )
        : __( 'Add Category Message', 'storegrowth-sales-booster' );

    const dialog = (
        <Dialog
            open={ draft !== null }
            onOpenChange={ ( isOpen: boolean ) => {
                if ( ! isOpen && ! saving ) {
                    setDraft( null );
                }
            } }
        >
            <DialogContent
                showCloseButton={ ! saving }
                className="w-[calc(100%-40px)] max-w-[520px]! bg-white p-6"
            >
                <form
                    className="flex flex-col gap-6"
                    noValidate
                    onSubmit={ ( event ) => {
                        event.preventDefault();
                        save();
                    } }
                >
                    <DialogHeader className="text-left">
                        <DialogTitle className="text-lg font-bold text-sg-heading">
                            { title }
                        </DialogTitle>
                        <DialogDescription className="sr-only">
                            { __(
                                'The message shows on the chosen product category’s page.',
                                'storegrowth-sales-booster'
                            ) }
                        </DialogDescription>
                    </DialogHeader>
                    <SelectField
                        id={ categoryId }
                        label={ __( 'Category', 'storegrowth-sales-booster' ) }
                        placeholder={ __(
                            'Select a category',
                            'storegrowth-sales-booster'
                        ) }
                        value={ draft?.category ?? '' }
                        options={ options }
                        onChange={ ( category ) => {
                            change( 'category', category );
                        } }
                        help={ __(
                            'The message shows on this category’s page.',
                            'storegrowth-sales-booster'
                        ) }
                        error={ errors.category }
                    />
                    <TextareaField
                        id={ messageId }
                        label={ __( 'Message', 'storegrowth-sales-booster' ) }
                        rows={ 3 }
                        value={ draft?.message ?? '' }
                        onChange={ ( message ) => {
                            change( 'message', message );
                        } }
                        error={ errors.message }
                    />
                    <DialogFooter className="flex flex-row justify-end gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            disabled={ saving }
                            onClick={ () => {
                                setDraft( null );
                            } }
                        >
                            { __( 'Cancel', 'storegrowth-sales-booster' ) }
                        </Button>
                        <Button
                            type="submit"
                            disabled={ saving }
                            aria-busy={ saving }
                        >
                            { saving
                                ? __( 'Saving…', 'storegrowth-sales-booster' )
                                : __( 'Save', 'storegrowth-sales-booster' ) }
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );

    // No messages at all.
    const noMessages = (
        <div className="flex flex-col items-center gap-3 px-6 py-12 text-center">
            <MessageSquareText className="size-10 text-sg-help" aria-hidden />
            <p className="m-0 text-base font-semibold text-sg-heading">
                { __(
                    'No category messages yet',
                    'storegrowth-sales-booster'
                ) }
            </p>
            <p className="m-0 max-w-md text-sm text-sg-text">
                { __(
                    'Tell shoppers about your BOGO deals on a product category page.',
                    'storegrowth-sales-booster'
                ) }
            </p>
            { addNew }
        </div>
    );

    // Module off: the list asks to turn it on.
    if ( ! isOn ) {
        return <Navigate to="/bogo" replace />;
    }

    return (
        <FeatureLayout moduleId="bogo">
            <div className="flex w-full flex-col">
                <CardHead
                    title={ __(
                        'Category Messages',
                        'storegrowth-sales-booster'
                    ) }
                    className="rounded-b-none"
                    actions={ headerActions }
                />
                <div className="w-full overflow-hidden rounded-b-lg border border-t-0 border-sg-cardline bg-white">
                    { upgrade }
                    <div className="*:rounded-t-none! *:border-none!">
                        <SlotFillProvider>
                            <DataViews< CategoryMessage >
                                namespace="storegrowth-bogo-messages"
                                // All are loaded (at most 100): page here.
                                data={ messages.slice(
                                    ( page - 1 ) * perPage,
                                    page * perPage
                                ) }
                                fields={ fields }
                                view={ { ...view, page } }
                                onChangeView={ ( next ) => {
                                    setSelection( [] );
                                    setView( next );
                                } }
                                selection={ selection }
                                onChangeSelection={ setSelection }
                                actions={ isPro ? actions : [] }
                                isLoading={ loading }
                                search={ false }
                                getItemId={ ( item ) => {
                                    return String( item.id );
                                } }
                                paginationInfo={ {
                                    totalItems: messages.length,
                                    totalPages: lastPage,
                                } }
                                empty={ noMessages }
                            />
                        </SlotFillProvider>
                    </div>
                </div>
            </div>
            { dialog }
        </FeatureLayout>
    );
}
