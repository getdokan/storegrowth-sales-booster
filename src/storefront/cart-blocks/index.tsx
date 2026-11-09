/**
 * Block cart, mini-cart and checkout script (`build/cart-blocks.js`, ADR-015):
 * automatic coupons' names, the rewards bar and StoreGrowth's notices, from
 * the Store API cart. Line labels and price steps need no script: they are
 * item data. The block mini-cart's bar is PHP bound to the cart state
 * (`modules/progressive-discount-banner/templates/rewards-bar-mini-cart.php`).
 *
 * @since SPSG_VERSION
 */
import type { CartBlocksWindow, RewardsProgress } from './types';

const { wc, wp } = window as unknown as CartBlocksWindow;

const CART_STORE = 'wc/store/cart';

function cartData() {
    return wp.data.select( CART_STORE ).getCartData().extensions?.storegrowth;
}

/**
 * @since SPSG_VERSION
 *
 * @param props         Props.
 * @param props.rewards Bar data.
 */
function RewardsBar( { rewards }: { rewards: RewardsProgress } ) {
    return (
        <div className="spsg-cart-rewards">
            <p className="spsg-cart-rewards__message">{ rewards.message }</p>
            <div className="spsg-cart-rewards__track">
                <div
                    className="spsg-cart-rewards__fill"
                    style={ { width: `${ rewards.percent }%` } }
                />
            </div>
            <ul className="spsg-cart-rewards__chips">
                { rewards.milestones.map( ( milestone ) => {
                    return (
                        <li
                            key={ milestone.text }
                            className={
                                milestone.reached
                                    ? 'spsg-cart-rewards__chip is-reached'
                                    : 'spsg-cart-rewards__chip'
                            }
                        >
                            { milestone.text }
                        </li>
                    );
                } ) }
            </ul>
            { rewards.unlocked.map( ( unlocked ) => {
                return (
                    <p
                        key={ unlocked.code }
                        className="spsg-cart-rewards__unlocked"
                    >
                        { unlocked.message }
                    </p>
                );
            } ) }
        </div>
    );
}

/**
 * The bar in the order summary of the block cart and checkout.
 *
 * @since SPSG_VERSION
 */
function RewardsSlot() {
    const { ExperimentalOrderMeta } = wc.blocksCheckout;
    const rewards = wp.data.useSelect( ( select ) => {
        return select( CART_STORE ).getCartData().extensions?.storegrowth
            ?.rewards;
    }, [] );

    if ( ! rewards || 'fly-cart' === rewards.placement ) {
        return null;
    }

    return (
        <ExperimentalOrderMeta>
            <RewardsBar rewards={ rewards } />
        </ExperimentalOrderMeta>
    );
}

wc.blocksCheckout.registerCheckoutFilters( 'storegrowth', {
    coupons: ( coupons ) => {
        const labels = cartData()?.coupon_labels ?? {};

        return coupons.map( ( coupon ) => {
            return labels[ coupon.code ]
                ? { ...coupon, label: labels[ coupon.code ] }
                : coupon;
        } );
    },
    showRemoveItemLink: ( value, extensions ) => {
        return value && ! extensions?.storegrowth?.is_reward_gift;
    },
} );

wp.plugins.registerPlugin( 'storegrowth-cart-rewards', {
    scope: 'woocommerce-checkout',
    render: RewardsSlot,
} );

const noticeContext =
    ( document.querySelector( '.wp-block-woocommerce-checkout' ) &&
        'wc/checkout' ) ||
    ( document.querySelector( '.wp-block-woocommerce-cart' ) && 'wc/cart' );

// Mini-cart-only pages have no notice area, and reading the cart there
// would fetch it on every page view.
if ( noticeContext ) {
    let shown: string[] | undefined;

    wp.data.subscribe( () => {
        const notices = cartData()?.notices;

        if ( ! notices?.length || notices === shown ) {
            return;
        }

        shown = notices;
        notices.forEach( ( notice ) => {
            wp.data
                .dispatch( 'core/notices' )
                .createInfoNotice( notice, { context: noticeContext } );
        } );
    }, CART_STORE );
}
