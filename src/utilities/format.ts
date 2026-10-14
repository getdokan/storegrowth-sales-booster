/**
 * Number formats of the offer reports (dashboard, Analytics page).
 *
 * @since SPSG_VERSION
 */
import type { PriceFormat } from './api';

/** The page's locale, as WordPress prints it on `<html lang>`. */
function locale(): string | undefined {
    return document.documentElement.lang || undefined;
}

/**
 * Money as WooCommerce prints it (`wc_price()`): its symbol, position,
 * separators and decimals, so it matches the dashboard and the store.
 *
 * @since SPSG_VERSION
 *
 * @param amount Amount.
 * @param price  WooCommerce's price format.
 */
export function formatMoney( amount: number, price: PriceFormat ): string {
    const [ whole, fraction ] = Math.abs( amount )
        .toFixed( price.decimals )
        .split( '.' );
    const grouped = whole.replace(
        /\B(?=(\d{3})+(?!\d))/g,
        price.thousand_separator
    );
    const number = fraction
        ? `${ grouped }${ price.decimal_separator }${ fraction }`
        : grouped;
    const formatted = price.format
        .replace( '%1$s', price.symbol )
        .replace( '%2$s', number )
        .replace( /&nbsp;/g, ' ' );

    return amount < 0 ? `-${ formatted }` : formatted;
}

/**
 * A count.
 *
 * @since SPSG_VERSION
 *
 * @param value Count.
 */
export function formatCount( value: number ): string {
    return new Intl.NumberFormat( locale() ).format( value );
}

/**
 * A percentage, or a dash without one.
 *
 * @since SPSG_VERSION
 *
 * @param value Percentage, e.g. 12.5.
 */
export function formatRate( value: number | null | undefined ): string {
    return null === value || undefined === value ? '—' : `${ value }%`;
}

/**
 * A `Y-m-d` day as a short date, e.g. "Oct 8".
 *
 * @since SPSG_VERSION
 *
 * @param day Day.
 */
export function formatDay( day: string ): string {
    const [ year, month, date ] = day.split( '-' ).map( Number );

    return new Intl.DateTimeFormat( locale(), {
        month: 'short',
        day: 'numeric',
    } ).format( new Date( year, month - 1, date ) );
}
