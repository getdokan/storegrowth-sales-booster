/**
 * A product in a record list cell (BOGO offers, order bumps): its
 * thumbnail and name, with anything under the name (prices, "+N").
 *
 * @since SPSG_VERSION
 */
import { decodeEntities } from '@wordpress/html-entities';
import type { ReactNode } from 'react';

export interface ProductCellProps {
    /** The product; without one the cell shows a dash. */
    product?: { name: string; image: string } | null;
    /** Under the name (prices). */
    after?: ReactNode;
}

/**
 * @since SPSG_VERSION
 *
 * @param props         Props.
 * @param props.product Product.
 * @param props.after   Under the name.
 */
export function ProductCell( { product, after }: ProductCellProps ) {
    if ( ! product ) {
        return <span className="text-sg-help">—</span>;
    }

    return (
        // Capped so a long product name can't push the table sideways.
        <span className="flex min-w-0 max-w-[200px] items-center gap-3">
            <img
                src={ product.image }
                alt=""
                className="size-[42px] shrink-0 rounded-full object-cover"
            />
            <span className="flex min-w-0 flex-col">
                <span
                    className="truncate text-sm font-semibold text-sg-heading"
                    title={ decodeEntities( product.name ) }
                >
                    { decodeEntities( product.name ) }
                </span>
                { after }
            </span>
        </span>
    );
}
