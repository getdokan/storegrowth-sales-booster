import { Row, Col, Image } from 'antd';
import { useDispatch, useSelect } from '@wordpress/data';

import { __ } from '@wordpress/i18n';
import ProductOne from "../../images/productOne.svg";
import ProductTwo from "../../images/productTwo.svg";
import ProductThree from "../../images/productThree.svg";
import ProductFour from "../../images/productFour.svg";
import React, { Fragment } from "react";
import ActionsHandler from "sales-booster/src/components/settings/Panels/PanelSettings/ActionsHandler";
import {createPopupForm} from "../helper";

const Template = ( { onFormSave } ) => {
    const { setCreateFromData } = useDispatch( 'sgsb_order_sales_pop' );

    const { createPopupFormData, getButtonLoading } = useSelect( ( select ) => ({
        createPopupFormData : select( 'sgsb_order_sales_pop' ).getCreateFromData(),
        getButtonLoading    : select( 'sgsb_order_sales_pop' ).getButtonLoading()
    }) );

    const productContent = [
        { svg: ProductOne, name: __( 'Nike Air Force 1 ‘07', 'storegrowth-sales-booster' ) },
        { svg: ProductTwo, name: __( 'Nike Air Max Plus', 'storegrowth-sales-booster' ) },
        { svg: ProductThree, name: __( 'Nike Air Max Plus', 'storegrowth-sales-booster' ) },
        { svg: ProductFour, name: __( 'Nike Air Force 1 ‘07', 'storegrowth-sales-booster' ) }
    ];

    // Use template common styles for render & update settings.
    const commonStyles = {
        background_color: '#FFF',
        spacing_around_image: 8,
        popup_image_width: 72,
        normal_text_color: '#1B1B50',
        normal_text_font_size: 10,
        normal_text_font_weight: 400,
        product_title_color: '#1B1B50',
        product_title_font_size: 16,
        product_title_font_weight: 500,
        city_text_color: '#1B1B50',
        city_text_font_size: 10,
        city_text_font_weight: 400,
        state_text_color: '#1B1B50',
        state_text_font_size: 10,
        state_text_font_weight: 400,
        country_text_color: '#1B1B50',
        country_text_font_size: 10,
        country_text_font_weight: 400,
        time_text_color: '#989FAB',
        time_text_font_size: 10,
        time_text_font_weight: 500,
        name_text_color: '#000',
        name_text_font_size: 10,
        name_text_font_weight: 500,
        show_close_button: true,
    };

    // Use template styles for multiple preview styles.
    const templateStyles = {
        popup_border_radius: [ 8, 100, 100, 8 ],
        popup_image_border_radius: [ 6, 100, 100, 6 ],
    };

    // Handle template settings on template option change.
    const onFieldChange = ( index ) => {
        setCreateFromData( {
            ...createPopupFormData,
            ...commonStyles,
            template: index + 1,
            popup_border_radius: templateStyles?.popup_border_radius?.[ index ],
            popup_image_border_radius: templateStyles.popup_image_border_radius[ index ],
        } );
    };

    const onFormReset = () => {
        setCreateFromData( { ...createPopupForm } );
    }

    return (
        <Fragment>
            <Row gutter={ [ 16, 16 ] } style={ { marginBottom: 40, position: 'relative' } }>
                { templateStyles && [ ...Array( 4 ).keys() ].map( index => (
                    <Col className={ `sales-pop-template` } onClick={ () => onFieldChange( index ) } key={ index } colSpan={ 12 } style={ { width: '50%' } }>
                        <div
                            style={ {
                                cursor: 'pointer',
                                position: 'relative',
                                background: commonStyles?.background_color,
                                padding: commonStyles?.spacing_around_image,
                                borderRadius: templateStyles?.popup_border_radius?.[ index ],
                                border: `1px solid ${ ( createPopupFormData?.template === ( index + 1 ) ) ? '#0875FF' : '#DDE6F9' }`,
                            } }
                            className="custom-notification-content-wrapper"
                        >
                            <div
                                style={ {
                                    gap: '16px',
                                    display: 'flex',
                                    alignItems: 'center',
                                } }
                                className="custom-notification-content"
                            >
                                <div className={ `product-image` } style={ { flex: 1 } }>
                                    <Image
                                        preview={ false }
                                        className="box-icon"
                                        src={ productContent?.[ index ]?.svg }
                                        alt={ __( 'Product Image', 'storegrowth-sales-booster' ) }
                                        style={ {
                                            width: commonStyles?.popup_image_width,
                                            borderRadius: templateStyles?.popup_image_border_radius?.[ index ]
                                        } }
                                    />
                                </div>
                                <div style={ { width: '100%', flex: 3 } } className={ `product-content` }>
                                    <p
                                        className="purchased-name"
                                        style={ {
                                            margin: 0,
                                            lineHeight: 1.5,
                                            color: commonStyles?.normal_text_color,
                                            fontSize: commonStyles?.normal_text_font_size,
                                            fontWeight: commonStyles?.normal_text_font_weight
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
                                            color: commonStyles?.product_title_color,
                                            fontSize: commonStyles?.product_title_font_size,
                                            fontWeight: commonStyles?.product_title_font_weight
                                        } }
                                    >
                                        <span id="product">
                                            { productContent?.[ index ]?.name }
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
                                                color: commonStyles?.city_text_color,
                                                fontSize: commonStyles?.city_text_font_size,
                                                fontWeight: commonStyles?.city_text_font_weight
                                            } }
                                        >
                                            { __( 'Pudong', 'storegrowth-sales-booster' ) }
                                        </span>,
                                        <span
                                            id="state"
                                            style={ {
                                                color: commonStyles?.state_text_color,
                                                fontSize: commonStyles?.state_text_font_size,
                                                fontWeight: commonStyles?.state_text_font_weight
                                            } }
                                        >
                                            { __( ' Shanghai', 'storegrowth-sales-booster' ) }
                                        </span>,
                                        <span
                                            id="country"
                                            style={ {
                                                color: commonStyles?.country_text_color,
                                                fontSize: commonStyles?.country_text_font_size,
                                                fontWeight: commonStyles?.country_text_font_weight
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
                                                color: commonStyles?.time_text_color,
                                                fontSize: commonStyles?.time_text_font_size,
                                                fontWeight: commonStyles?.time_text_font_weight
                                            } }
                                        >
                                            { __( '15 minutes ago', 'storegrowth-sales-booster' ) }
                                        </span>
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
                                                    color: commonStyles?.name_text_color,
                                                    fontSize: commonStyles?.name_text_font_size,
                                                    fontWeight: commonStyles?.name_text_font_weight
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
                                    top: ( index === 1 || index === 2 ) ? '50%' : 2,
                                    transform: ( index === 1 || index === 2 ) ? 'translateY(-50%)' : '',
                                    right:( index === 1 || index === 2 ) ? 15 : 10,
                                    position: 'absolute',
                                    display: commonStyles?.show_close_button ? 'block' : 'none'
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
                    </Col>
                ) ) }
            </Row>

            <ActionsHandler
                resetHandler={ onFormReset }
                loadingHandler={ getButtonLoading }
                saveHandler={ () => onFormSave( 'general_settings' ) }
            />
        </Fragment>
    );
}

export default Template;
