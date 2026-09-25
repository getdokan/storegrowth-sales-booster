/**
 * Template picker (design `.sb-tpl` / `.tpl`): a column of preset toggles
 * (plugin-ui ToggleGroup), each drawn by the module as a miniature of what it produces. Selecting one
 * calls `onSelect`; the module writes the preset's values into its fields.
 *
 * @since SPSG_VERSION
 */
import { ToggleGroup, ToggleGroupItem } from '@wedevs/plugin-ui';
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
        <ToggleGroup
            orientation="vertical"
            spacing={ 3 }
            value={ [ value ] }
            // Clicking the selected preset empties the group; keep it.
            onValueChange={ ( next ) => next[ 0 ] && onSelect( next[ 0 ] ) }
            disabled={ locked }
            className="w-full"
        >
            { templates.map( ( template ) => (
                <ToggleGroupItem
                    key={ template.id }
                    value={ template.id }
                    aria-label={ template.label }
                    className="h-auto w-full flex-col items-stretch gap-1.5 whitespace-normal rounded-lg border-2 border-solid border-sg-stroke bg-white px-3 py-2.5 text-left font-normal hover:bg-white disabled:opacity-60 aria-pressed:border-sg-brand aria-pressed:bg-white aria-pressed:shadow-[0_0_0_3px_rgba(8,117,255,.18)]"
                >
                    { template.preview }
                </ToggleGroupItem>
            ) ) }
        </ToggleGroup>
    );
}
