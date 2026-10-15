/**
 * The dashboard's white card: rounded, a hairline inset border, padded, with
 * an optional title. Used for the dashboard's stat tiles and the Analytics
 * page's tiles and cards.
 *
 * @since 3.0.0
 */
import { cn } from '@wedevs/plugin-ui';
import type { ReactNode } from 'react';

export interface CardProps {
    /** Card title, a level-2 heading above the content. */
    title?: ReactNode;
    children: ReactNode;
    /** Extra classes; they win over the defaults (e.g. a different padding). */
    className?: string;
}

/**
 * @since 3.0.0
 *
 * @param props           Props.
 * @param props.title     Title.
 * @param props.children  Content.
 * @param props.className Extra classes.
 */
export function Card( { title, children, className }: CardProps ) {
    return (
        <section
            className={ cn(
                'flex min-w-0 flex-col gap-5 rounded-[16px] bg-white p-6 shadow-[inset_0_0_0_1px_var(--color-sg-hairline)]',
                className
            ) }
        >
            { title && (
                <h2 className="text-[16px] font-semibold leading-6 text-sg-ink">
                    { title }
                </h2>
            ) }
            { children }
        </section>
    );
}
