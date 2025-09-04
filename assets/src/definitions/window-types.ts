import { Hooks } from '@wordpress/hooks';
import WooCommerceAccounting from './woocommerce-accounting.d';

/**
 * To get spsg supports just import like a normal js file
 * Ex: import '../path.../src/definitions/window-types';
 */

interface Currency {
    precision: number;
    symbol: string;
    decimal: string;
    thousand: string;
    format: string;
    position: string;
}

interface StoreGrowth {
    currency?: Currency;
}

declare global {
    interface Window extends Window {
        wp: {
            hooks: Hooks;
        };
        accounting: WooCommerceAccounting.AccountingStatic;
        spsg?: StoreGrowth;
    }
}

// This empty export is necessary to make this a module
export {};
