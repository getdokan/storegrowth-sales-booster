/**
 * A settings page built from the page its schema defines (PHP
 * `SettingsPage`): title card, then the page's tabs beside the preview (when
 * the module adds one). Each tab draws its fields in field order (module
 * fields, then the ones extensions add), groups a section's fields in its
 * accordion and ends with the tab's Save bar. The module keeps only its
 * preview and any control the page draws itself (`controls`, e.g. a template
 * picker that sets several keys).
 *
 * The admin app draws it at `#/settings?module=<id>`, inside the page frame;
 * the selected tab is in the URL (`&tab=design`).
 *
 * @since SPSG_VERSION
 */
import { Skeleton, toast } from '@wedevs/plugin-ui';
import { Fragment } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import type { ReactNode } from 'react';
import { type ModuleSettings, useSearchParams } from '@storegrowth/hooks';
import {
    errorMessage,
    getHeaderData,
    type SettingField,
    type SettingValue,
    type ShowWhen,
} from '@storegrowth/utilities';

import { Accordion } from './accordion';
import { CardHead } from './card-head';
import { extensionKeys, SchemaField } from './field-renderer';
import { CheckboxGroup } from './fields';
import { OptionCard } from './option-card';
import { SaveBar } from './save-bar';
import { SettingsSplit } from './settings-split';
import { SettingsTabs } from './settings-tabs';

type Values = Record< string, SettingValue >;

export interface ModuleSettingsPageProps< V extends Values > {
    /** Title while the page loads (then the page's own title). */
    title?: string;
    /** The page's `useModuleSettings()`. */
    settings: ModuleSettings< V >;
    /** Preview column, usually `LivePreview`. */
    preview?: ReactNode;
    /** The page will have a preview: the loading skeleton draws its column. */
    hasPreview?: boolean;
    /** The page has tabs: the loading skeleton draws the tab bar. */
    hasTabs?: boolean;
    /** Controls the page draws itself instead of a field's, by key. */
    controls?: Partial< Record< keyof V, ReactNode > >;
}

interface SkeletonShape {
    /** Draw the preview column. */
    hasPreview?: boolean;
    /** Draw the tab bar. */
    hasTabs?: boolean;
}

/**
 * A skeleton block, in the divider grey (visible on white while it pulses).
 *
 * @param props           Props.
 * @param props.className Size and shape.
 */
function Block( { className }: { className: string } ) {
    return <Skeleton className={ `bg-sg-line ${ className }` } />;
}

/**
 * A whole settings page while the pages load: title card and skeleton.
 *
 * @since SPSG_VERSION
 *
 * @param props            Props.
 * @param props.title      Page title.
 * @param props.hasPreview Draw the preview column.
 * @param props.hasTabs    Draw the tab bar.
 */
export function ModuleSettingsSkeleton( {
    title,
    hasPreview = false,
    hasTabs = true,
}: SkeletonShape & { title: string } ) {
    return (
        <div className="flex w-full flex-col">
            <CardHead title={ title } className="rounded-b-none" />
            <LoadingSkeleton hasPreview={ hasPreview } hasTabs={ hasTabs } />
        </div>
    );
}

/**
 * The shape of a settings page while it loads: tab bar, field rows, Save
 * bar, and the preview column when the page has one.
 *
 * @param props            Props.
 * @param props.hasPreview Draw the preview column.
 * @param props.hasTabs    Draw the tab bar.
 */
function LoadingSkeleton( { hasPreview, hasTabs }: SkeletonShape ) {
    const preview = hasPreview ? (
        <div className="flex w-full flex-auto flex-col">
            <div className="flex w-full items-center justify-between gap-4 border border-l-0 border-t-0 border-sg-cardline bg-white px-6 py-3 @max-[932px]:border-l">
                <Block className="h-5 w-16" />
                <Block className="h-9 w-32" />
            </div>
            <div className="flex w-full flex-auto items-center justify-center rounded-br-lg border border-l-0 border-t-0 border-sg-cardline bg-sg-preview p-10 @max-[932px]:rounded-b-lg @max-[932px]:border-l">
                <Skeleton className="h-[320px] w-full max-w-[420px] rounded-md bg-white" />
            </div>
        </div>
    ) : undefined;

    return (
        <SettingsSplit preview={ preview }>
            <div
                aria-busy="true"
                aria-label={ __( 'Loading…', 'storegrowth-sales-booster' ) }
                className="flex w-full flex-col items-start gap-6"
            >
                { hasTabs && <Block className="h-10 w-56 rounded-lg" /> }
                { [ 0, 1, 2, 3 ].map( ( row ) => {
                    return (
                        <div key={ row } className="flex w-full flex-col gap-2">
                            <Block className="h-4 w-36" />
                            <Block className="h-10 w-full" />
                        </div>
                    );
                } ) }
                <div className="flex w-full justify-end gap-3">
                    <Block className="h-10 w-20" />
                    <Block className="h-10 w-20" />
                </div>
            </div>
        </SettingsSplit>
    );
}

/**
 * What a module adds to its settings page, through the JS filter
 * `storegrowth.settings.page` ( parts, moduleId ). Render functions of the
 * page's settings, so they see unsaved values.
 *
 * @since SPSG_VERSION
 */
export interface SettingsPageParts< V extends Values = Values > {
    /** Preview column, usually `LivePreview`. */
    preview?: ( settings: ModuleSettings< V > ) => ReactNode;
    /** Controls the page draws itself instead of a field's, by key. */
    controls?: (
        settings: ModuleSettings< V >
    ) => Partial< Record< keyof V, ReactNode > >;
}

/**
 * Split keys into runs of consecutive keys with the same value of `by`.
 *
 * @param keys Keys in order.
 * @param by   Grouping value of a key.
 */
function runs< T >( keys: string[], by: ( key: string ) => T ) {
    const groups: Array< { id: T; keys: string[] } > = [];

    keys.forEach( ( key ) => {
        const last = groups[ groups.length - 1 ];

        if ( last && last.id === by( key ) ) {
            last.keys.push( key );
        } else {
            groups.push( { id: by( key ), keys: [ key ] } );
        }
    } );

    return groups;
}

/**
 * @since SPSG_VERSION
 *
 * @param props            Props.
 * @param props.title      Title while loading.
 * @param props.settings   Module settings.
 * @param props.preview    Preview column.
 * @param props.hasPreview The page will have a preview (loading skeleton).
 * @param props.hasTabs    The page has tabs (loading skeleton).
 * @param props.controls   Page-drawn controls by key.
 */
export function ModuleSettingsPage< V extends Values >( {
    title,
    settings,
    preview,
    hasPreview = false,
    hasTabs = true,
    controls = {},
}: ModuleSettingsPageProps< V > ) {
    const schema = settings.schema as Record< string, SettingField >;
    const pageTitle = settings.page.title ?? title ?? '';
    // A page without tabs is one group of its fields without a `tab`.
    const pageTabs = settings.page.tabs ?? {
        '': { label: '', sections: settings.page.sections },
    };
    const [ searchParams, setSearchParams ] = useSearchParams();
    const tabIds = Object.keys( pageTabs );
    const requested = searchParams.get( 'tab' ) ?? '';
    const activeTab = tabIds.includes( requested ) ? requested : tabIds[ 0 ];

    // Keep the tab in the URL, replacing the entry (tabs aren't history).
    const selectTab = ( id: string ) => {
        setSearchParams(
            ( current ) => {
                const next = new URLSearchParams( current );
                next.set( 'tab', id );
                return next;
            },
            { replace: true }
        );
    };

    const save = async ( keys: string[] ) => {
        try {
            await settings.save( keys );
            toast.success(
                __( 'Settings saved.', 'storegrowth-sales-booster' )
            );
        } catch ( error ) {
            toast.error(
                errorMessage(
                    error,
                    __(
                        'The settings could not be saved.',
                        'storegrowth-sales-booster'
                    )
                )
            );
        }
    };

    const field = ( key: string ) => {
        return (
            <Fragment key={ key }>
                { controls[ key ] ?? (
                    <SchemaField
                        fieldKey={ key as keyof V & string }
                        settings={ settings }
                    />
                ) }
            </Fragment>
        );
    };

    // Consecutive checkboxes sit in one checkbox column; consecutive
    // half-width fields share a row.
    const kind = ( key: string ) => {
        if ( schema[ key ]?.width === 'half' ) {
            return 'half';
        }

        if ( ! controls[ key ] && schema[ key ]?.variant === 'checkbox' ) {
            return 'checkbox';
        }

        return '';
    };

    // `show_when`: every key's value is the given one (or one of a list).
    const matches = ( conditions?: ShowWhen ) => {
        return Object.entries( conditions ?? {} ).every(
            ( [ key, wanted ] ) => {
                const value = settings.values[ key ];
                const allowed = Array.isArray( wanted ) ? wanted : [ wanted ];

                return allowed.some( ( item ) => {
                    return String( item ) === String( value );
                } );
            }
        );
    };

    const isShown = ( key: string ) => {
        return ! schema[ key ]?.hidden && matches( schema[ key ]?.show_when );
    };

    const isToggleLocked = ( key: string ) => {
        return (
            settings.isLocked( key ) ||
            ( Boolean( schema[ key ]?.pro_ui ) &&
                ! getHeaderData().header_info.is_pro_exists )
        );
    };

    const fields = ( keys: string[] ) => {
        return runs( keys.filter( isShown ), kind ).map( ( run ) => {
            if ( 'checkbox' === run.id ) {
                return (
                    <CheckboxGroup key={ run.keys[ 0 ] }>
                        { run.keys.map( field ) }
                    </CheckboxGroup>
                );
            }

            if ( 'half' === run.id ) {
                return (
                    <div
                        key={ run.keys[ 0 ] }
                        className="flex w-full flex-wrap gap-4"
                    >
                        { run.keys.map( ( key ) => {
                            return (
                                <div
                                    key={ key }
                                    className="min-w-[180px] flex-1"
                                >
                                    { field( key ) }
                                </div>
                            );
                        } ) }
                    </div>
                );
            }

            return run.keys.map( field );
        } );
    };

    const tabs = Object.entries( pageTabs ).map( ( [ id, tab ] ) => {
        const keys = extensionKeys( schema, id );

        // A section's fields all go in its accordion, where the section
        // first appears (an extension field joins the module's section);
        // fields without a known section stay in place.
        const groups: Array< { section: string; keys: string[] } > = [];
        keys.forEach( ( key ) => {
            const section = schema[ key ]?.section ?? '';
            const known = Boolean( tab.sections?.[ section ] );
            const last = groups[ groups.length - 1 ];
            let group = last && ! last.section ? last : undefined;

            if ( known ) {
                group = groups.find( ( item ) => {
                    return item.section === section;
                } );
            }

            if ( group ) {
                group.keys.push( key );
            } else {
                groups.push( { section: known ? section : '', keys: [ key ] } );
            }
        } );

        return {
            id,
            label: tab.label,
            content: (
                <>
                    { groups.map( ( group ) => {
                        const section = tab.sections?.[ group.section ];

                        if ( ! section ) {
                            return (
                                <Fragment key={ group.keys[ 0 ] }>
                                    { fields( group.keys ) }
                                </Fragment>
                            );
                        }

                        if ( ! matches( section.show_when ) ) {
                            return null;
                        }

                        // A section with `toggle`: that switch field sits in
                        // the header and the body shows while it's on.
                        const toggleKey = section.toggle;
                        const body = fields(
                            group.keys.filter( ( key ) => {
                                return key !== toggleKey;
                            } )
                        );

                        if ( ! toggleKey ) {
                            return (
                                <Accordion
                                    key={ group.keys[ 0 ] }
                                    title={ section.title }
                                    help={ section.help }
                                    defaultOpen={ ! section.collapsed }
                                >
                                    { body }
                                </Accordion>
                            );
                        }

                        const toggle = {
                            checked: Boolean( settings.values[ toggleKey ] ),
                            onChange: ( checked: boolean ) => {
                                settings.setValue(
                                    toggleKey,
                                    checked as V[ keyof V ]
                                );
                            },
                            locked: isToggleLocked( toggleKey ),
                        };

                        if ( section.card ) {
                            return (
                                <OptionCard
                                    key={ group.keys[ 0 ] }
                                    title={ section.title }
                                    help={ section.help }
                                    { ...toggle }
                                >
                                    { body }
                                </OptionCard>
                            );
                        }

                        return (
                            <Accordion
                                key={ group.keys[ 0 ] }
                                title={ section.title }
                                help={ section.help }
                                toggle={ {
                                    ...toggle,
                                    label: section.toggle_label,
                                } }
                            >
                                { body }
                            </Accordion>
                        );
                    } ) }
                    { /* Nothing to save or reset when every field needs pro. */ }
                    { ! keys.every( settings.isLocked ) && (
                        <SaveBar
                            saving={ settings.saving }
                            disabled={ ! settings.isDirty( keys ) }
                            onReset={ () => {
                                settings.reset( keys );
                            } }
                            onSave={ () => {
                                save( keys );
                            } }
                        />
                    ) }
                </>
            ),
        };
    } );

    // One card: the title on top, one border line below it.
    return (
        <div className="flex w-full flex-col">
            <CardHead title={ pageTitle } className="rounded-b-none" />
            { settings.loading && (
                <LoadingSkeleton
                    hasPreview={ hasPreview }
                    hasTabs={ hasTabs }
                />
            ) }
            { ! settings.loading && settings.loadError && (
                <div
                    role="alert"
                    className="w-full rounded-b-lg border border-t-0 border-sg-cardline bg-white p-6 text-sm text-destructive"
                >
                    { settings.loadError }
                </div>
            ) }
            { ! settings.loading && ! settings.loadError && (
                <SettingsSplit preview={ preview }>
                    { /* No tabs: the fields sit under the title. */ }
                    { ! settings.page.tabs ? (
                        <div className="flex w-full flex-col items-start gap-3">
                            { tabs[ 0 ].content }
                        </div>
                    ) : (
                        <SettingsTabs
                            label={ sprintf(
                                /* translators: %s: module name, e.g. Stock Bar */
                                __(
                                    '%s settings',
                                    'storegrowth-sales-booster'
                                ),
                                pageTitle
                            ) }
                            tabs={ tabs }
                            value={ activeTab }
                            onValueChange={ selectTab }
                        />
                    ) }
                </SettingsSplit>
            ) }
        </div>
    );
}
