/**
 * Page title card (design `.card-head`): bordered white card with the page
 * title on the left and optional actions on the right.
 *
 * @since SPSG_VERSION
 */
import { cn } from '@wedevs/plugin-ui';
import type { ReactNode } from 'react';

export interface CardHeadProps {
    title: ReactNode;
    /** Right-aligned content, e.g. a master switch or an Add New button. */
    actions?: ReactNode;
    className?: string;
}

/**
 * @since SPSG_VERSION
 *
 * @param props           Props.
 * @param props.title     Page title.
 * @param props.actions   Right-aligned content.
 * @param props.className Extra classes.
 */
export function CardHead( { title, actions, className }: CardHeadProps ) {
    return (
        <div
            className={ cn(
                'flex w-full items-center justify-between gap-4 rounded-[8px] border border-sg-cardline bg-white p-6',
                className
            ) }
        >
            <h1 className="text-[18px] font-bold leading-[1.3] text-sg-heading">
                { title }
            </h1>
            { actions && (
                <div className="flex shrink-0 items-center gap-2.5">
                    { actions }
                </div>
            ) }
        </div>
    );
}
