/**
 * Icon picker (design `.seg`): label on the left; the icons in a segmented
 * pill on the right, plus an optional Upload button for a custom icon from
 * the media library. The uploaded icon's address shows once there is one.
 *
 * @since SPSG_VERSION
 */
import { Button, cn, ToggleGroup, ToggleGroupItem } from '@wedevs/plugin-ui';
import { useId } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { Upload, type LucideIcon } from 'lucide-react';

import { FIELD_LABEL, ProBadge } from './field-label';
import { TextField } from './text-field';

export interface IconPickerProps {
    label: string;
    /** The icons, in display order: stored value, name, lucide icon. */
    icons: Array< { value: string; label: string; Icon: LucideIcon } >;
    /** Stored value; `''` for none. */
    value: string;
    onChange: ( value: string ) => void;
    /** Pressing the chosen icon again clears it (default true). */
    clearable?: boolean;
    /**
     * Custom icon address; with `onCustomChange` the picker offers Upload.
     * The storefront shows it while no icon is chosen.
     */
    custom?: string;
    onCustomChange?: ( value: string ) => void;
    locked?: boolean;
    error?: string;
    /**
     * The label is for screen readers only and the pill sits on the left
     * (a section title already names it).
     */
    hideLabel?: boolean;
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
 * @param title  Media frame title.
 * @param onPick Called with the chosen file's address.
 */
function openMedia( title: string, onPick: ( url: string ) => void ) {
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
        title,
        library: { type: 'image' },
        multiple: false,
    } );
    frame.on( 'select', () =>
        onPick( frame.state().get( 'selection' ).first().toJSON().url )
    );
    frame.open();
}

/**
 * @since SPSG_VERSION
 *
 * @param props                Props.
 * @param props.label          Label.
 * @param props.icons          Icons.
 * @param props.value          Chosen value.
 * @param props.onChange       Value handler.
 * @param props.clearable      Pressing the chosen icon clears it.
 * @param props.custom         Custom icon address.
 * @param props.onCustomChange Custom icon handler.
 * @param props.locked         Pro field without pro.
 * @param props.error          Custom icon error.
 * @param props.hideLabel      Label for screen readers only.
 */
export function IconPicker( {
    label,
    icons,
    value,
    onChange,
    clearable = true,
    custom = '',
    onCustomChange,
    locked,
    error,
    hideLabel = false,
}: IconPickerProps ) {
    const labelId = useId();

    return (
        <div className="flex w-full flex-col gap-3">
            <div
                className={ cn(
                    'flex w-full flex-wrap items-center gap-3',
                    ! hideLabel && 'justify-between'
                ) }
            >
                <span
                    id={ labelId }
                    className={ cn(
                        'flex items-center gap-2',
                        FIELD_LABEL,
                        hideLabel && ! locked && 'sr-only'
                    ) }
                >
                    { label }
                    { locked && <ProBadge /> }
                </span>
                <span className="flex shrink-0 items-center gap-2">
                    <ToggleGroup
                        aria-labelledby={ labelId }
                        value={ value ? [ value ] : [] }
                        onValueChange={ ( next ) =>
                            ( next[ 0 ] || clearable ) &&
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
                    { onCustomChange && (
                        <Button
                            variant="outline"
                            disabled={ locked }
                            // An upload clears the icon, so the storefront shows the upload.
                            onClick={ () =>
                                openMedia( label, ( url ) => {
                                    onCustomChange( url );
                                    onChange( '' );
                                } )
                            }
                            className="h-11 gap-2 border-sg-brand text-sg-brand"
                        >
                            <Upload className="size-4" aria-hidden />
                            { __( 'Upload', 'storegrowth-sales-booster' ) }
                        </Button>
                    ) }
                </span>
            </div>
            { onCustomChange && ( custom || error ) && (
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
