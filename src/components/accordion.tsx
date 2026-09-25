/**
 * Collapsible settings group (design `.acc`): bordered box with a title, help
 * line and chevron; open by default.
 *
 * @since SPSG_VERSION
 */
import { cn } from '@wedevs/plugin-ui';
import { useId, useState } from '@wordpress/element';
import { ChevronUp } from 'lucide-react';
import type { ReactNode } from 'react';

export interface AccordionProps {
    title: ReactNode;
    /** Grey line under the title. */
    help?: ReactNode;
    /** Start collapsed. */
    defaultOpen?: boolean;
    children: ReactNode;
    className?: string;
}

/**
 * @since SPSG_VERSION
 *
 * @param props             Props.
 * @param props.title       Group title.
 * @param props.help        Line under the title.
 * @param props.defaultOpen Open on first render (default true).
 * @param props.children    Fields.
 * @param props.className   Extra classes.
 */
export function Accordion( {
    title,
    help,
    defaultOpen = true,
    children,
    className,
}: AccordionProps ) {
    const [ open, setOpen ] = useState( defaultOpen );
    const bodyId = useId();

    return (
        <section
            className={ cn(
                'flex w-full flex-col items-start gap-3 rounded-[5px] border border-[#E9E9E9] bg-white p-4',
                className
            ) }
        >
            <button
                type="button"
                className="flex w-full cursor-pointer items-center gap-3 border-0 bg-transparent p-0 text-left"
                aria-expanded={ open }
                aria-controls={ bodyId }
                onClick={ () => setOpen( ( value ) => ! value ) }
            >
                <span className="flex min-w-px flex-1 flex-col items-start gap-2">
                    <span className="text-base font-bold text-sg-text">
                        { title }
                    </span>
                    { help && (
                        <span className="text-xs leading-[1.4] text-sg-help">
                            { help }
                        </span>
                    ) }
                </span>
                <ChevronUp
                    className={ cn(
                        'size-6 shrink-0 transition-transform duration-150',
                        open ? 'text-sg-brand' : 'rotate-180 text-sg-help'
                    ) }
                    strokeWidth={ 1.5 }
                    aria-hidden
                />
            </button>
            { open && (
                <>
                    <div className="h-px w-full bg-sg-line" />
                    <div
                        id={ bodyId }
                        className="flex w-full flex-col items-start gap-4"
                    >
                        { children }
                    </div>
                </>
            ) }
        </section>
    );
}
