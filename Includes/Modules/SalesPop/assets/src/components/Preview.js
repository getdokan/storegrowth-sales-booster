import React from "react";
import { Image } from "antd";
import { __ } from "@wordpress/i18n";
import ProductOne from "../../images/productOne.svg";
import ProductTwo from "../../images/productTwo.svg";
import ProductThree from "../../images/productThree.svg";
import ProductFour from "../../images/productFour.svg";

const Preview = ( { storeData } ) => {
    const productContent = [
        { svg: ProductOne, name: __( 'Nike Air Force 1 ‘07', 'storegrowth-sales-booster' ) },
        { svg: ProductTwo, name: __( 'Nike Air Max Plus', 'storegrowth-sales-booster' ) },
        { svg: ProductThree, name: __( 'Nike Air Max Plus', 'storegrowth-sales-booster' ) },
        { svg: ProductFour, name: __( 'Nike Air Force 1 ‘07', 'storegrowth-sales-booster' ) }
    ];

    return (
        <div
            style={ {
                position: 'relative',
                border: '1px solid #DDE6F9',
                background: storeData?.background_color,
                padding: storeData?.spacing_around_image,
                borderRadius: storeData?.popup_border_radius,
            } }
            className="custom-notification-content-wrapper"
        >
            <div
                style={ {
                    gap: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    flexDirection: storeData?.image_position === 'right' ? 'row-reverse' : 'unset'
                } }
                className="custom-notification-content"
            >
                <div className={ `product-image` } style={ { flex: 1 } }>
                    <Image
                        preview={ false }
                        src={ productContent?.[ storeData?.template - 1 ]?.svg }
                        alt={ __( 'Product Image', 'storegrowth-sales-booster' ) }
                        style={ {
                            width: storeData?.popup_image_width,
                            borderRadius: storeData?.popup_image_border_radius
                        } }
                    />
                </div>
                <div style={ { width: '100%', flex: 3 } } className={ `product-content` }>
                    <p
                        className="purchased-name"
                        style={ {
                            margin: 0,
                            lineHeight: 1.5,
                            color: storeData?.normal_text_color,
                            fontSize: storeData?.normal_text_font_size,
                            fontWeight: storeData?.normal_text_font_weight
                        } }
                    >
                        <span id="virtual-name">
                            { __( 'Mark Wood Just purchased', 'storegrowth-sales-booster' ) }
                        </span>
                        <br/>
                    </p>
                    <p
                        className="product-name"
                        style={ {
                            margin: 0,
                            marginTop: 3,
                            lineHeight: 1.5,
                            color: storeData?.product_title_color,
                            fontSize: storeData?.product_title_font_size,
                            fontWeight: storeData?.product_title_font_weight
                        } }
                    >
                        <span id="product">
                            { __( 'Nike Air Force 1 ‘07', 'storegrowth-sales-booster' ) }
                        </span>
                        <br/>
                    </p>
                    <p
                        className="country-details"
                        style={ {
                            margin: 0,
                            fontSize: 10,
                            lineHeight: 1.5,
                            color: '#1B1B50'
                        } }
                    >
                        { __( 'From: ', 'storegrowth-sales-booster' ) }
                        <span
                            id="city"
                            style={ {
                                color: storeData?.city_text_color,
                                fontSize: storeData?.city_text_font_size,
                                fontWeight: storeData?.city_text_font_weight
                            } }
                        >
                            { __( 'Pudong', 'storegrowth-sales-booster' ) }
                        </span>,
                        <span
                            id="state"
                            style={ {
                                color: storeData?.state_text_color,
                                fontSize: storeData?.state_text_font_size,
                                fontWeight: storeData?.state_text_font_weight
                            } }
                        >
                            { __( ' Shanghai', 'storegrowth-sales-booster' ) }
                        </span>,
                        <span
                            id="country"
                            style={ {
                                color: storeData?.country_text_color,
                                fontSize: storeData?.country_text_font_size,
                                fontWeight: storeData?.country_text_font_weight
                            } }
                        >
                            { __( ' China', 'storegrowth-sales-booster' ) }
                        </span>
                        <br/>
                    </p>
                    <p
                        style={ {
                            margin: 0,
                            marginTop: 5,
                            lineHeight: 1,
                            display: 'flex',
                            justifyContent: 'space-between',
                        } }
                        className="shop-time-row"
                    >
                        <span
                            id="time"
                            style={ {
                                color: storeData?.time_text_color,
                                fontSize: storeData?.time_text_font_size,
                                fontWeight: storeData?.time_text_font_weight
                            } }
                        >{ __( '15 minutes ago', 'storegrowth-sales-booster' ) }</span>
                        <span
                            id="shop"
                            style={ {
                                fontSize: 10,
                                color: '#989FAB',
                            } }
                        >
                            { __( 'by ', 'storegrowth-sales-booster' ) }
                            <span
                                id={ `shop-name` }
                                style={ {
                                    color: storeData?.name_text_color,
                                    fontSize: storeData?.name_text_font_size,
                                    fontWeight: storeData?.name_text_font_weight
                                } }
                            >
                                { __( 'StoreGrowth', 'storegrowth-sales-booster' ) }
                            </span>
                        </span>
                        <br/>
                    </p>
                </div>
            </div>
            <div
                className="custom-close"
                style={ {
                    top: ( storeData?.template === 2 || storeData?.template === 3 ) ? '50%' : 2,
                    transform: ( storeData?.template === 2 || storeData?.template === 3 ) ? 'translateY(-50%)' : '',
                    right: ( storeData?.template === 2 || storeData?.template === 3 ) ? 15 : 10,
                    position: 'absolute',
                    display: storeData?.show_close_button ? 'block' : 'none'
                } }
            >
                <svg width="8" height="8" fill="none">
                    <g clipPath="url(#A)" fill="#989fab">
                        <path d="M.391 8a.39.39 0 0 1-.361-.241.39.39 0 0 1 .085-.426L7.333.114a.39.39 0 0 1 .553 0 .39.39 0 0 1 0 .553L.667 7.886A.39.39 0 0 1 .391 8z" />
                        <path d="M7.609 8a.39.39 0 0 1-.276-.114L.114.667a.39.39 0 0 1 0-.552.39.39 0 0 1 .553 0l7.219 7.219a.39.39 0 0 1 .085.426.39.39 0 0 1-.361.241z" />
                    </g>
                    <defs>
                        <clipPath id="A">
                            <path fill="#fff" d="M0 0h8v8H0z" />
                        </clipPath>
                    </defs>
                </svg>
            </div>
        </div>
    );
}

export default Preview;
