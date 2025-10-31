import metadata from './blocks/block.json'
import OrderBumpTemplate from "./blocks/OrderBumpTemplate";

const {registerCheckoutBlock, ExperimentalOrderMeta} = window.wc.blocksCheckout;
const bumpData = window.wc.wcSettings.getSetting('storegrowth-upsell-order-bump_data') || [];


const OrderBump = () => {
    return (
        <ExperimentalOrderMeta>
            {bumpData.map((item, index) => (
                <OrderBumpTemplate design={item.design_settings} offerData={item} key={index}/>
            ))}
        </ExperimentalOrderMeta>
    )
}


registerCheckoutBlock({
    metadata,
    component: OrderBump,
});
