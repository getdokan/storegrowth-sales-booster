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

    if ( ! window?.sgsb?.currency ) {
        console.warn( 'StoreGrowth Currency Data Not Found' );
        return price;
    }

    if ( ! currencySymbol ) {
        currencySymbol = window?.sgsb?.currency.symbol;
    }

    if ( ! precision ) {
        precision = window?.sgsb?.currency.precision;
    }

    if ( ! thousand ) {
        thousand = window?.sgsb?.currency.thousand;
    }

    if ( ! decimal ) {
        decimal = window?.sgsb?.currency.decimal;
    }

    if ( ! format ) {
        format = window?.sgsb?.currency.format;
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

    if ( ! window?.sgsb?.currency ) {
        console.warn( 'StoreGrowth Currency Data Not Found' );
        return value;
    }

    return window.accounting.formatNumber(
        value,
        // @ts-ignore
        window?.sgsb?.currency.precision,
        window?.sgsb?.currency.thousand,
        window?.sgsb?.currency.decimal
    );
};

export const unformatNumber = ( value ) => {
    if ( value === '' ) {
        return value;
    }
    return window.accounting.unformat(
        value,
        window?.sgsb?.currency.decimal
    );
};
