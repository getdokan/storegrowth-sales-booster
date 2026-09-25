/**
 * StoreGrowth storefront core (ADR-005 S6, S9): device check, display
 * trigger and dismiss helpers shared by the bars and popups.
 *
 * Plain JS, no dependencies. Handle `spsg-storefront-core`; exposed as
 * `window.spsgStorefront`. The behaviour copies today's bar scripts
 * (`modules/*\/assets/js/banner-bar-remove.js`) exactly, including the
 * dismiss storage keys and times, so migrated bars keep their state.
 */
( function ( window, document ) {
    'use strict';

    /** Same breakpoint as today's bar scripts. */
    var MOBILE_MAX_WIDTH = 768;

    /** Today's dismiss period: 10 minutes. */
    var DISMISS_MINUTES = 10;

    /**
     * Whether the visitor is on a mobile-width screen.
     *
     * @return {boolean} True at 768px wide or less.
     */
    function isMobile() {
        return window.innerWidth <= MOBILE_MAX_WIDTH;
    }

    /**
     * Whether the chosen devices (`banner_device_view`) include this one.
     *
     * @param {string[]} deviceView e.g. [ 'banner-show-desktop', 'banner-show-mobile' ].
     * @return {boolean} True when the widget should show on this device.
     */
    function matchesDevice( deviceView ) {
        var view = Array.isArray( deviceView ) ? deviceView : [];
        var mobile = isMobile();

        return (
            ( mobile && view.indexOf( 'banner-show-mobile' ) !== -1 ) ||
            ( ! mobile && view.indexOf( 'banner-show-desktop' ) !== -1 )
        );
    }

    /**
     * Whether a widget was dismissed and the dismiss period hasn't ended.
     *
     * @param {string} key Storage key, e.g. `fn_banner_hidden_time`.
     * @return {boolean} True while dismissed.
     */
    function isDismissed( key ) {
        var until;

        try {
            until = window.localStorage.getItem( key );
        } catch ( e ) {
            return false;
        }

        return !! until && parseInt( until, 10 ) >= Date.now();
    }

    /**
     * Remember that a widget was dismissed.
     *
     * @param {string} key       Storage key.
     * @param {number} [minutes] Dismiss period (default 10).
     */
    function dismiss( key, minutes ) {
        var period = ( minutes || DISMISS_MINUTES ) * 60 * 1000;

        try {
            window.localStorage.setItem( key, String( Date.now() + period ) );
        } catch ( e ) {
            // Storage unavailable (private mode): the widget shows again next page.
        }
    }

    /**
     * Run `callback` when the widget's trigger fires:
     * - `after-few-seconds`: after `delay` seconds;
     * - anything else: once the page scrolls past `scrollThreshold` pixels,
     *   then after `scrollDelay` seconds.
     *
     * @param {Object}   options
     * @param {string}   options.trigger         `banner_trigger`.
     * @param {number}   options.delay           `banner_delay` (seconds).
     * @param {number}   options.scrollDelay     `scroll_banner_delay` (seconds).
     * @param {number}   options.scrollThreshold Scroll distance (pixels).
     * @param {Function} callback                Shows the widget.
     * @return {Function} Cancels the pending trigger.
     */
    function onTrigger( options, callback ) {
        var timer = null;
        var onScroll = null;

        if ( options.trigger === 'after-few-seconds' ) {
            timer = window.setTimeout( callback, ( options.delay || 0 ) * 1000 );
        } else {
            onScroll = function () {
                var top = window.pageYOffset || document.documentElement.scrollTop;

                if ( top > ( options.scrollThreshold || 0 ) ) {
                    window.removeEventListener( 'scroll', onScroll );
                    onScroll = null;
                    timer = window.setTimeout(
                        callback,
                        ( options.scrollDelay || 0 ) * 1000
                    );
                }
            };
            window.addEventListener( 'scroll', onScroll, { passive: true } );
        }

        return function cancel() {
            if ( timer ) {
                window.clearTimeout( timer );
            }
            if ( onScroll ) {
                window.removeEventListener( 'scroll', onScroll );
            }
        };
    }

    window.spsgStorefront = {
        isMobile: isMobile,
        matchesDevice: matchesDevice,
        isDismissed: isDismissed,
        dismiss: dismiss,
        onTrigger: onTrigger,
    };
} )( window, document );
