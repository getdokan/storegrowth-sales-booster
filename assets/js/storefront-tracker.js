/**
 * StoreGrowth storefront tracker (ADR-012): counts views and clicks of
 * module widgets and sends them in one batch when the page is left.
 *
 * Plain JS, no cookies, no visitor id, so it works on cached pages. Handle
 * `spsg-storefront-tracker`; adds `track()` to `window.spsgStorefront`
 * (loads after `spsg-storefront-core`, which creates it). Settings:
 * `window.spsgTracker = { url }`, the `sales-booster/v1/analytics/track` route.
 *
 * Usage:
 * - Markup: `data-spsg-track="upsell-order-bump" data-spsg-object="campaign:12"`
 *   counts a `view` when the element is first seen on screen.
 * - Add `data-spsg-track-add-to-cart` to a `product:{id}` element to also count
 *   `add_to_cart` of that product on the page: the product form's submit and
 *   WooCommerce's ajax `added_to_cart` event, once per session like a view.
 * - Script: `window.spsgStorefront.track( module, metric, objectType, objectId )`.
 *
 * Views and marked add-to-carts are counted once per browser session and
 * object (sessionStorage); other metrics every time.
 *
 * @since SPSG_VERSION
 */
( function ( window, document ) {
    'use strict';

    var settings = window.spsgTracker || {};
    var queue = {};
    var SEEN_KEY = 'spsgTrackSeen';

    /**
     * Objects already counted as viewed in this browser session.
     *
     * @return {Object} Map of seen keys.
     */
    function readSeen() {
        try {
            return JSON.parse( window.sessionStorage.getItem( SEEN_KEY ) ) || {};
        } catch ( e ) {
            return {};
        }
    }

    /**
     * Whether a view was already counted this session; marks it counted.
     *
     * @param {string} key Event key.
     * @return {boolean} True when it was seen before.
     */
    function seenBefore( key ) {
        var seen = readSeen();

        if ( seen[ key ] ) {
            return true;
        }
        seen[ key ] = 1;

        try {
            window.sessionStorage.setItem( SEEN_KEY, JSON.stringify( seen ) );
        } catch ( e ) {
            // Storage off: the view still counts.
        }

        return false;
    }

    /**
     * Queue one count.
     *
     * @param {string} module     Module id.
     * @param {string} metric     Metric, e.g. `view`, `click`.
     * @param {string} objectType `campaign` or `product`.
     * @param {number} objectId   Offer row id or product id; 0 for the module.
     */
    function track( module, metric, objectType, objectId ) {
        var key = [ module, metric, objectType, parseInt( objectId, 10 ) || 0 ].join( '|' );

        if ( 'view' === metric && seenBefore( key ) ) {
            return;
        }
        queue[ key ] = ( queue[ key ] || 0 ) + 1;
    }

    /**
     * Send the queued counts, once, as the page is left.
     */
    function flush() {
        var keys = Object.keys( queue );

        if ( ! keys.length || ! settings.url || ! navigator.sendBeacon ) {
            return;
        }

        var events = keys.map( function ( key ) {
            var parts = key.split( '|' );

            return {
                module: parts[ 0 ],
                metric: parts[ 1 ],
                object_type: parts[ 2 ],
                object_id: parseInt( parts[ 3 ], 10 ),
                count: queue[ key ],
            };
        } );

        queue = {};
        navigator.sendBeacon(
            settings.url,
            new Blob( [ JSON.stringify( { events: events } ) ], { type: 'application/json' } )
        );
    }

    /**
     * A marked element's object, from `data-spsg-object="type:id"`.
     *
     * @param {Element} element Marked element.
     * @return {string[]} Object type and id.
     */
    function objectOf( element ) {
        return ( element.getAttribute( 'data-spsg-object' ) || '' ).split( ':' );
    }

    /**
     * Count a view of each marked element when it first shows on screen.
     */
    function watchMarkedElements() {
        var elements = document.querySelectorAll( '[data-spsg-track]' );

        if ( ! elements.length ) {
            return;
        }

        function viewed( element ) {
            var object = objectOf( element );

            track( element.getAttribute( 'data-spsg-track' ), 'view', object[ 0 ], object[ 1 ] );
        }

        if ( ! window.IntersectionObserver ) {
            Array.prototype.forEach.call( elements, viewed );
            return;
        }

        var observer = new window.IntersectionObserver( function ( entries ) {
            entries.forEach( function ( entry ) {
                if ( entry.isIntersecting ) {
                    viewed( entry.target );
                    observer.unobserve( entry.target );
                }
            } );
        } );

        Array.prototype.forEach.call( elements, function ( element ) {
            observer.observe( element );
        } );
    }

    /**
     * Count add-to-carts of the products marked `data-spsg-track-add-to-cart`.
     */
    function watchAddToCart() {
        var elements = document.querySelectorAll( '[data-spsg-track-add-to-cart]' );

        if ( ! elements.length ) {
            return;
        }

        // Once per session and product, like views, so adds per view is a share of visits.
        function added( productId ) {
            Array.prototype.forEach.call( elements, function ( element ) {
                var module = element.getAttribute( 'data-spsg-track' );
                var object = objectOf( element );

                if ( 'product' === object[ 0 ] && String( productId ) === object[ 1 ] && ! seenBefore( [ module, 'add_to_cart', 'product', object[ 1 ] ].join( '|' ) ) ) {
                    track( module, 'add_to_cart', object[ 0 ], object[ 1 ] );
                }
            } );
        }

        // The product form posting the page. An ajax form cancels the post
        // and fires `added_to_cart` instead, counted below.
        window.addEventListener( 'submit', function ( event ) {
            var form = event.target;
            var field = form.classList && form.classList.contains( 'cart' ) ? form.querySelector( '[name="add-to-cart"]' ) : null;

            if ( field && ! event.defaultPrevented ) {
                added( field.value );
            }
        } );

        // WooCommerce triggers it through jQuery only.
        if ( window.jQuery ) {
            window.jQuery( document.body ).on( 'added_to_cart', function ( event, fragments, cartHash, button ) {
                added( button ? window.jQuery( button ).data( 'product_id' ) : 0 );
            } );
        }
    }

    window.addEventListener( 'pagehide', flush );
    document.addEventListener( 'visibilitychange', function () {
        if ( 'hidden' === document.visibilityState ) {
            flush();
        }
    } );

    if ( 'loading' === document.readyState ) {
        document.addEventListener( 'DOMContentLoaded', watchMarkedElements );
        document.addEventListener( 'DOMContentLoaded', watchAddToCart );
    } else {
        watchMarkedElements();
        watchAddToCart();
    }

    window.spsgStorefront = window.spsgStorefront || {};
    window.spsgStorefront.track = track;
} )( window, document );
