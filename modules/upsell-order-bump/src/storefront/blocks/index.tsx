/**
 * Order Bump checkout block (WooCommerce cart / checkout / mini-cart blocks).
 *
 * Registered by `OrderBumpCheckoutIntegration` under the script handle and
 * integration name `storegrowth-upsell-order-bump`; the block name comes from
 * `block.json` and must not change (ADR-004).
 *
 * @since SPSG_VERSION
 */
import metadata from './block.json';
import OrderBumpTemplate from './order-bump-template';
import type { BumpOffer } from './types';

const { registerCheckoutBlock, ExperimentalOrderMeta } =
    window.wc.blocksCheckout;
const bumpData =
    window.wc.wcSettings.getSetting< BumpOffer[] >(
        'storegrowth-upsell-order-bump_data'
    ) || [];

const OrderBump = () => {
    return (
        <ExperimentalOrderMeta>
            { bumpData.map( ( item, index ) => {
                return (
                    <OrderBumpTemplate
                        design={ item.design_settings }
                        offerData={ item }
                        key={ index }
                    />
                );
            } ) }
        </ExperimentalOrderMeta>
    );
};

registerCheckoutBlock( {
    metadata,
    component: OrderBump,
} );
