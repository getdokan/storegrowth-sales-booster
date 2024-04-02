import React from 'react';
import { Image, Typography } from 'antd';
import { __ } from '@wordpress/i18n';
import PreviewImg from '../../images/bump-preview.svg';

const { Title } = Typography;

const Preview = ( { storeData } ) => {
    const offerAmount = storeData?.offer_amount ? storeData?.offer_amount : '(?)';
    const product_image_url = products_and_categories?.product_list_for_view[storeData.offer_product]?.image_url;
    const addCommas = (number) => {
        return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        }
    const product = products_and_categories?.product_list?.simpleProductForOffer
        ?.find( simpleProduct => simpleProduct?.value === parseInt( storeData.offer_product ) );
    let discountedPrice = parseFloat( storeData?.offer_amount )?.toFixed( 2 );

    if ( storeData?.offer_type === 'discount' ) {
        const currencySymbol = product?.currency;
        const productPrice = parseFloat( product?.price?.replace(new RegExp('[' + currencySymbol + ',]', 'g'), '')),
            discountPercent = ( parseFloat( storeData?.offer_amount + '%' ) / 100 );
        discountedPrice = ( productPrice - ( productPrice * discountPercent ) )?.toFixed( 2 );
    }

    return (
        <div
            style={ {
                gap: 8,
                padding: 8,
                display: 'grid',
                borderRadius: 10,
                background: '#FFF',
                marginTop: parseInt( storeData?.box_top_margin ),
                marginBottom: parseInt( storeData?.box_bottom_margin ),
                border: storeData?.box_border_style !== 'no_border' ? `1px ${ storeData?.box_border_style } ${ storeData?.box_border_color }` : 0,
            } }
            className='bump-preview-wrapper'
        >
            <div
                className={ `offer-heading` }
                style={ {
                    gap: 6,
                    paddingTop: 8,
                    display: 'flex',
                    fontWeight: 500,
                    borderRadius: 5,
                    paddingBottom: 8,
                    textAlign: 'center',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: `${ storeData?.discount_text_color }`,
                    fontSize: `${ storeData?.discount_font_size }px`,
                    background: `${ storeData?.discount_background_color }`,
                } }
            >
                <svg style={ { marginTop: 1 } } width='12' height='12' viewBox='0 0 12 12' fill='none' xmlns='http://www.w3.org/2000/svg'>
                    <path
                        fill={ `${ storeData?.discount_text_color }` }
                        d='M6.35818 0.158203C6.08866 0.158203 5.81928 0.261688 5.61466 0.466306L5.2127 0.868251C4.84967 1.23128 4.35705 1.43443 3.84365 1.43443H3.2095C2.63076 1.43443 2.15787 1.90729 2.15787 2.48604V2.95182V3.12053C2.15787 3.63394 1.95471 4.12619 1.59169 4.48922L1.18974 4.89117C0.780504 5.3004 0.780504 5.96965 1.18974 6.37888L1.59169 6.78083C1.95471 7.14386 2.15787 7.63577 2.15787 8.14918V8.78366C2.15787 9.36241 2.63076 9.83528 3.2095 9.83528H3.84365C4.35705 9.83528 4.84967 10.0388 5.2127 10.4018L5.61466 10.8034C6.02389 11.2126 6.69247 11.2126 7.1017 10.8034L7.504 10.4018C7.86703 10.0388 8.35931 9.83528 8.87271 9.83528H9.50686C10.0856 9.83528 10.5585 9.36241 10.5585 8.78366V8.14918C10.5585 7.63577 10.7634 7.14386 11.1264 6.78083L11.528 6.37888C11.9372 5.96964 11.9372 5.30041 11.528 4.89117L11.1264 4.48922C10.7634 4.12618 10.5585 3.63394 10.5585 3.12053V2.48604C10.5585 1.90729 10.0856 1.43443 9.50686 1.43443H8.87271C8.35931 1.43443 7.86703 1.23128 7.504 0.868251L7.1017 0.466306C6.89709 0.261687 6.6277 0.158204 6.35818 0.158203ZM5.03537 3.41518C5.52954 3.41518 5.93415 3.82012 5.93415 4.31429C5.93415 4.80846 5.52954 5.21341 5.03537 5.21341C4.54119 5.21341 4.13623 4.80846 4.13623 4.31429C4.13623 3.82012 4.54119 3.41518 5.03537 3.41518ZM8.13402 3.65669C8.18088 3.65643 8.22593 3.6748 8.25926 3.70775C8.27581 3.72405 8.28899 3.74346 8.29803 3.76486C8.30708 3.78625 8.31182 3.80923 8.31198 3.83246C8.31214 3.85569 8.30772 3.87873 8.29897 3.90025C8.29022 3.92177 8.27732 3.94136 8.261 3.95789L4.67896 7.56092C4.64604 7.59399 4.60137 7.6127 4.5547 7.61296C4.50804 7.61322 4.46315 7.59502 4.42986 7.56232C4.41325 7.54601 4.40004 7.52659 4.39096 7.50516C4.38188 7.48373 4.37713 7.46071 4.37697 7.43744C4.37681 7.41417 4.38124 7.39109 4.39002 7.36954C4.3988 7.34798 4.41175 7.32837 4.42812 7.31184L8.01015 3.70916C8.04292 3.67603 8.08743 3.65717 8.13402 3.65669ZM5.03537 3.76882C4.73224 3.76882 4.48988 4.0112 4.48988 4.31429C4.48988 4.61739 4.73224 4.85977 5.03537 4.85977C5.33849 4.85977 5.58085 4.61739 5.58085 4.31429C5.58085 4.0112 5.33849 3.76882 5.03537 3.76882ZM7.68134 6.05629C8.17552 6.05629 8.58047 6.46124 8.58047 6.95541C8.58047 7.44958 8.17552 7.85314 7.68134 7.85314C7.18717 7.85314 6.78359 7.44958 6.78359 6.95541C6.78359 6.46124 7.18717 6.05629 7.68134 6.05629ZM7.68134 6.40993C7.37822 6.40993 7.1369 6.65231 7.1369 6.95541C7.1369 7.2585 7.37822 7.50088 7.68134 7.50088C7.98447 7.50088 8.22648 7.2585 8.22648 6.95541C8.22648 6.65231 7.98447 6.40993 7.68134 6.40993Z'
                    />
                </svg>
                {
                    storeData?.offer_type === 'price' ?
                    offerAmount + __( storeData.offer_fixed_price_title, 'storegrowth-sales-booster' ) :
                    offerAmount + __( storeData.offer_discount_title, 'storegrowth-sales-booster' )
                }
            </div>
            <div
                className={ `bump-product-preview` }
                style={ {
                    gap: 14,
                    display: 'flex',
                    alignItems: 'center',
                } }
            >
                <Image
                    preview={ false }
                    style={ { width: 76, height: 76, borderRadius: 7 } }
                    src={ product_image_url || PreviewImg }
                    alt={ __( 'Product Image', 'storegrowth-sales-booster' ) }
                />
                <div
                    style={ { flex: 3 } }
                    className={ `product-content` }
                >
                    <Title
                        level={ 3 }
                        className={ `product-title` }
                        style={ {
                            margin: 0,
                            fontWeight: 500,
                            color: `${ storeData?.product_description_text_color }`,
                            fontSize: `${ storeData?.product_description_font_size }px`,
                        } }
                    >
                        { typeof product !== 'undefined' ? storeData?.offer_product_title : __( 'Nike Air Max Plus', 'storegrowth-sales-booster' ) }
                    </Title>
                    <p
                        className={ `product-category` }
                        style={ {
                            margin: 0,
                            fontSize: 12,
                            color: `${ storeData?.product_description_text_color }`,
                        } }
                    >
                        { product?.offer_categories ? product?.offer_categories : __(  'Men\'s Shoe', 'storegrowth-sales-booster' ) }
                    </p>
                </div>
                <div
                    className={ `product-price` }
                    style={ {
                        flex: 1.5,
                        fontWeight: 500,
                        color: `${ storeData?.product_description_text_color }`,
                        fontSize: `${ storeData?.product_description_font_size }px`,
                    } }
                >
                    { !isNaN(discountedPrice) ? ( product?.currency + addCommas(discountedPrice) ) : __( '$87.00', 'storegrowth-sales-booster' ) }
                </div>
                <div
                    className={ `product-selection-icon` }
                    style={ {
                        gap: 8,
                        flex: 1.1,
                        fontSize: 10,
                        display: 'flex',
                        alignItems: 'center',
                        color: `${ storeData?.product_description_text_color }`,
                    } }
                >
                    <div
                        className={ `selection-checkbox` }
                        style={ {
                            width: 10,
                            height: 10,
                            display: 'flex',
                            borderRadius: 2,
                            alignItems: 'center',
                            background: '#0275ff',
                            justifyContent: 'center',
                        } }
                    >
                        <svg width='6' height='6' viewBox='0 0 6 6' fill='none' xmlns='http://www.w3.org/2000/svg'>
                            <g clipPath='url(#clip0_1052_490)'>
                                <path d='M4.93522 1.2632C4.77976 1.10753 4.52731 1.10763 4.37164 1.2632L1.83514 3.7998L0.707774 2.67244C0.552104 2.51677 0.299766 2.51677 0.144096 2.67244C-0.0115737 2.82811 -0.0115737 3.08045 0.144096 3.23612L1.55324 4.64527C1.63103 4.72305 1.73303 4.76205 1.83503 4.76205C1.93704 4.76205 2.03913 4.72315 2.11692 4.64527L4.93522 1.82687C5.09089 1.67131 5.09089 1.41886 4.93522 1.2632Z' fill='white'/>
                            </g>
                            <defs>
                                <clipPath id='clip0_1052_490'>
                                    <rect width='5.02463' height='5.02463' fill='white' transform='translate(0.0273438 0.441406)'/>
                                </clipPath>
                            </defs>
                        </svg>
                    </div>
                    { __( 'Select', 'storegrowth-sales-booster' ) }
                </div>
            </div>
        </div>
    );
}

export default Preview;
