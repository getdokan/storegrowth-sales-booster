import { __ } from "@wordpress/i18n";

const OfferProductContent = ( { offerProduct, bumpItem } ) => {
    const product = products_and_categories?.product_list?.simpleProductForOffer
        ?.find( simpleProduct => simpleProduct?.value === parseInt( bumpItem.offer_product ) );
    let discountedPrice = parseFloat( bumpItem?.offer_amount )?.toFixed( 2 );

    if ( bumpItem?.offer_type === 'discount' ) {
        const productPrice = parseFloat(product?.price?.replace(product?.currency, ''));
        const discountPercent = parseFloat(bumpItem?.offer_amount + '%') / 100;
        discountedPrice = (productPrice - productPrice * discountPercent).toFixed(2);

    }

    return (
        <div>
            <span style={ { marginBottom: 12, display: 'inline-block' } }>{ offerProduct }</span>
            <br/>
            <span style={ { marginBottom: 12, display: 'inline-block' } }>
                { __( 'Product price: ', 'storegrowth-sales-booster' ) + product?.price }
            </span>
            <br/>
            <span style={ { marginBottom: 12, display: 'inline-block' } }>
                { __( 'Discounted price: ', 'storegrowth-sales-booster' ) + product?.currency + discountedPrice }
            </span>
        </div>
    );
}

export default OfferProductContent;
