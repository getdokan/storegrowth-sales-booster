import '../definitions/window-types'
export const formatPrice = (
    price: number | string = '',
    currencySymbol = '',
    precision = null,
    thousand = '',
    decimal = '',
    format = ''
): string | number => {
    if ( ! window.accounting ) {
        console.warn( 'Woocommerce Accounting Library Not Found' );
        return price;
    }

    if ( ! window?.spsg?.currency ) {
        console.warn( 'StoreGrowth Currency Data Not Found' );
        return price;
    }

    if ( ! currencySymbol ) {
        currencySymbol = window?.spsg?.currency.symbol;
    }

    if ( ! precision ) {
        precision = window?.spsg?.currency.precision;
    }

    if ( ! thousand ) {
        thousand = window?.spsg?.currency.thousand;
    }

    if ( ! decimal ) {
        decimal = window?.spsg?.currency.decimal;
    }

    if ( ! format ) {
        format = window?.spsg?.currency.format;
    }

    return window.accounting.formatMoney(
        price,
        currencySymbol,
        precision,
        thousand,
        decimal,
        format
    );
};

export const formatNumber = ( value ) => {
    if ( value === '' ) {
        return value;
    }

    if ( ! window.accounting ) {
        console.warn( 'Woocommerce Accounting Library Not Found' );
        return value;
    }

    if ( ! window?.spsg?.currency ) {
        console.warn( 'StoreGrowth Currency Data Not Found' );
        return value;
    }

    return window.accounting.formatNumber(
        value,
        // @ts-ignore
        window?.spsg?.currency.precision,
        window?.spsg?.currency.thousand,
        window?.spsg?.currency.decimal
    );
};

export const unformatNumber = ( value ) => {
    if ( value === '' ) {
        return value;
    }
    return window.accounting.unformat(
        value,
        window?.spsg?.currency.decimal
    );
};
