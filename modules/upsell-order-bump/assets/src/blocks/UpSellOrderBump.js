import OrderBumpTemplate from "./OrderBumpTemplate";

const bumpOrders = window.wc.wcSettings.getSetting('storegrowth-upsell-order-bump_data') || [];

const UpSellOrderBump = () => {
    return (
        <>
            {bumpOrders.map((item, index) => (
                <OrderBumpTemplate design={item.design_settings} offerData={item} key={index}/>
            ))}
        </>
    )
}


export default UpSellOrderBump;
