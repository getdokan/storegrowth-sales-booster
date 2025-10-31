import metadata from './blocks/block.json'
import UpSellOrderBump from "./blocks/UpSellOrderBump";

const {registerCheckoutBlock, ExperimentalOrderMeta} = window.wc.blocksCheckout;


const OrderBump = (props) => {
    return (
        <ExperimentalOrderMeta>
            <UpSellOrderBump {...props} />
        </ExperimentalOrderMeta>
    )
}


registerCheckoutBlock({
    metadata,
    component: OrderBump,
});
