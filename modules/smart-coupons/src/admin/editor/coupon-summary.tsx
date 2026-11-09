/**
 * The editor's right rail: a plain summary of the coupon, and the cart line
 * shoppers see.
 *
 * @since SPSG_VERSION
 */
import { __, sprintf } from '@wordpress/i18n';
import type { SettingValue } from '@storegrowth/utilities';

interface CouponSummaryProps {
    values: Record< string, SettingValue >;
    currency: string;
}

/**
 * The coupon as plain text lines.
 *
 * @param values   Editor values.
 * @param currency Store currency symbol.
 */
function summaryLines(
    values: Record< string, SettingValue >,
    currency: string
) {
    const lines: string[] = [];

    if ( values.method === 'automatic' ) {
        lines.push(
            __( 'Applies automatically', 'storegrowth-sales-booster' )
        );
    } else if ( values.method === 'code' ) {
        lines.push(
            sprintf(
                /* translators: %s: discount code. */
                __( 'Code %s', 'storegrowth-sales-booster' ),
                String( values.code || '…' ).toUpperCase()
            )
        );
    } else {
        lines.push( __( 'Applies from a link', 'storegrowth-sales-booster' ) );
    }

    if ( values.discount_type === 'percentage' ) {
        lines.push( `${ values.amount }% off` );
    } else if ( values.discount_type === 'fixed' ) {
        lines.push( `${ currency }${ values.amount } off the cart` );
    } else if ( values.discount_type === 'tiers' ) {
        lines.push( __( 'Buy more save more', 'storegrowth-sales-booster' ) );
    } else {
        lines.push( __( 'Buy X get Y', 'storegrowth-sales-booster' ) );
    }

    lines.push(
        values.apply_to === 'store'
            ? __( 'Entire store', 'storegrowth-sales-booster' )
            : __( 'Specific items', 'storegrowth-sales-booster' )
    );

    if ( values.minimum_type === 'subtotal' ) {
        lines.push(
            `${ __(
                'Minimum subtotal',
                'storegrowth-sales-booster'
            ) } ${ currency }${ values.minimum_amount }`
        );
    } else if ( values.minimum_type === 'quantity' ) {
        lines.push(
            `${ __( 'Minimum quantity', 'storegrowth-sales-booster' ) } ${
                values.minimum_quantity
            }`
        );
    }

    if ( values.one_per_customer ) {
        lines.push( __( 'One use per customer', 'storegrowth-sales-booster' ) );
    }

    if ( values.skip_sale ) {
        lines.push(
            __( 'Skips products already on sale', 'storegrowth-sales-booster' )
        );
    }

    if ( values.combines ) {
        lines.push(
            __(
                'Can combine with other StoreGrowth deals',
                'storegrowth-sales-booster'
            )
        );
    }

    if ( values.allow_others ) {
        lines.push(
            __( 'Allowed with other coupons', 'storegrowth-sales-booster' )
        );
    }

    return lines;
}

/**
 * @since SPSG_VERSION
 *
 * @param props          Props.
 * @param props.values   Editor values.
 * @param props.currency Store currency symbol.
 */
export function CouponSummary( { values, currency }: CouponSummaryProps ) {
    const lines = summaryLines( values, currency );
    const title =
        String( values.title ) ||
        __( 'Your coupon', 'storegrowth-sales-booster' );

    return (
        <div className="flex w-full flex-col gap-4 rounded-br-lg border border-l-0 border-t-0 border-sg-cardline bg-white p-6 @max-[932px]:rounded-b-lg @max-[932px]:border-l">
            <section className="flex flex-col gap-2">
                <h2 className="m-0 text-sm font-semibold text-sg-heading">
                    { __( 'Summary', 'storegrowth-sales-booster' ) }
                </h2>
                <ul className="m-0 list-disc ps-4 text-sm text-sg-text">
                    { lines.map( ( line ) => {
                        return <li key={ line }>{ line }</li>;
                    } ) }
                </ul>
            </section>
            <section className="flex flex-col gap-2">
                <h2 className="m-0 text-sm font-semibold text-sg-heading">
                    { __( 'Shoppers will see', 'storegrowth-sales-booster' ) }
                </h2>
                <div className="flex justify-between rounded-lg border border-sg-line p-3 text-sm text-sg-text">
                    <span>{ title }</span>
                    <span>
                        { values.discount_type === 'buy_x_get_y'
                            ? __(
                                  'Free item added',
                                  'storegrowth-sales-booster'
                              )
                            : __( '- discount', 'storegrowth-sales-booster' ) }
                    </span>
                </div>
            </section>
        </div>
    );
}
