/**
 * Template picker (design `.sb-tpl` / `.tpl`): a column of preset buttons,
 * each drawn by the module as a miniature of what it produces. Selecting one
 * calls `onSelect`; the module writes the preset's values into its fields.
 *
 * @since SPSG_VERSION
 */
import { cn } from '@wedevs/plugin-ui';
import type { ReactNode } from 'react';

export interface TemplateOption {
    id: string;
    /** Accessible name, e.g. "Blue template". */
    label: string;
    /** Miniature of the result. */
    preview: ReactNode;
}

export interface TemplatePickerProps {
    templates: TemplateOption[];
    /** Id of the current template. */
    value: string;
    onSelect: ( id: string ) => void;
    /** Pro field without pro. */
    locked?: boolean;
}

/**
 * @since SPSG_VERSION
 *
 * @param props           Props.
 * @param props.templates Presets.
 * @param props.value     Current preset id.
 * @param props.onSelect  Select handler.
 * @param props.locked    Not editable.
 */
export function TemplatePicker( {
    templates,
    value,
    onSelect,
    locked = false,
}: TemplatePickerProps ) {
    return (
        <div className="flex w-full flex-col items-stretch gap-3">
            { templates.map( ( template ) => {
                const selected = template.id === value;

                return (
                    <button
                        key={ template.id }
                        type="button"
                        aria-pressed={ selected }
                        aria-label={ template.label }
                        disabled={ locked }
                        className={ cn(
                            'flex w-full cursor-pointer flex-col gap-1.5 rounded-lg border-2 border-solid bg-white px-3 py-2.5 text-left disabled:cursor-not-allowed disabled:opacity-60',
                            selected
                                ? 'border-sg-brand shadow-[0_0_0_3px_rgba(8,117,255,.18)]'
                                : 'border-sg-stroke'
                        ) }
                        onClick={ () => onSelect( template.id ) }
                    >
                        { template.preview }
                    </button>
                );
            } ) }
        </div>
    );
}
