import React, {Fragment} from 'react';
import { __ } from "@wordpress/i18n";
import { Image, Typography } from 'antd';
import PreviewImg from '../../images/qcart-preview.svg';
import CartIcon from "./CartIcon";
import UpgradeCrown from "sales-booster/src/components/settings/Panels/PanelSettings/UpgradeCrown";

const { Title } = Typography;

const Preview = ( { storeData } ) => {
    return (
        <Fragment>
            <div
                className='wfc-widget'
                style={ {
                    padding: 26,
                    borderTopLeftRadius: 10,
                    borderBottomLeftRadius: 10,
                    background: storeData?.widget_bg_color,
                } }
            >
                <div
                    className='qc-cart-heading'
                    style={ { marginBottom: 6 } }
                >
                    <Title
                        level={ 3 }
                        className='wfc-cart-heading'
                        style={ {
                            margin: 0,
                            fontSize: 36,
                            fontWeight: 600,
                            color: '#073B4C',
                        } }
                    >
                        { __( 'Shopping Cart', 'storegrowth-sales-booster' ) }
                        <span
                            className='wfc-close-btn sgsb-cart-widget-close'
                            style={ {
                                marginTop: 6,
                                float: 'right',
                                display: 'flex',
                            } }
                        >
                        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" clipRule="evenodd" d="M15.1503 0.329175C15.5892 -0.109725 16.3008 -0.109725 16.7397 0.329174C17.1786 0.768074 17.1786 1.47967 16.7397 1.91857L10.1236 8.53466L16.7398 15.1508C17.1787 15.5897 17.1787 16.3013 16.7398 16.7402C16.3009 17.1791 15.5893 17.1791 15.1504 16.7402L8.53424 10.1241L1.91857 16.7397C1.47967 17.1786 0.768073 17.1786 0.329174 16.7397C-0.109726 16.3008 -0.109724 15.5892 0.329175 15.1503L6.94484 8.53466L0.329203 1.91902C-0.109697 1.48012 -0.109697 0.768522 0.329203 0.329623C0.768102 -0.109276 1.4797 -0.109275 1.9186 0.329624L8.53424 6.94527L15.1503 0.329175Z" fill="#B9C9EB" />
                        </svg>
                    </span>
                    </Title>
                </div>
                <div className='sgsb-widget-shopping-cart-content-wrapper'>
                    <div className='sgsb-widget-shopping-cart-content'>
                        <div
                            className='sgsb-cart-item-count'
                            style={ {
                                fontWeight: 500,
                                marginBottom: 30,
                                color: '#345f6f',
                            } }
                        >
                            { __( 'You have 3 items in your cart', 'storegrowth-sales-booster' ) }
                        </div>
                        <div
                            className='sgsb-fly-cart-table'
                            style={ {
                                width: '100%',
                                marginBottom: 30,
                            } }
                        >
                            <div className='sgsb-fly-cart-table-body'>
                                <div
                                    style={ {
                                        padding: 16,
                                        display: 'flex',
                                        borderRadius: 10,
                                        background: '#FFF',
                                        alignItems: 'center',
                                        border: '1px solid #DDE6F9',
                                    } }
                                    className='woocommerce-cart-form__cart-item cart_item'
                                >
                                    { storeData?.show_product_image && (
                                        <div
                                            className='product-thumbnail'
                                            style={ { marginRight: 14 } }
                                        >
                                            <Image
                                                preview={ false }
                                                src={ PreviewImg }
                                                alt={ __( 'Product Image', 'storegrowth-sales-booster' ) }
                                            />
                                        </div>
                                    ) }

                                    <div
                                        className='product-name'
                                        style={ { marginRight: 16 } }
                                    >
                                        <div className='sgsb-product-title'>
                                            <div
                                                style={ {
                                                    fontSize: 12,
                                                    paddingTop: 3,
                                                    paddingLeft: 10,
                                                    paddingBottom: 3,
                                                    paddingRight: 10,
                                                    borderRadius: 10,
                                                    color: '#35606f',
                                                    display: 'inline',
                                                    background: '#EFF2F9'
                                                } }
                                                className='sgsb-product-category'
                                            >
                                                { __( 'Hoodies', 'storegrowth-sales-booster' ) }
                                            </div>
                                            <div
                                                style={ {
                                                    fontSize: 14,
                                                    marginTop: 5,
                                                    fontWeight: 500,
                                                    color: '#073B4C',
                                                } }
                                                className='sgsb-product-name'
                                            >
                                                { __( 'Hoodie with Zipper', 'storegrowth-sales-booster' ) }
                                            </div>
                                        </div>
                                    </div>

                                    { storeData?.show_quantity_picker && (
                                        <div
                                            className='quantity'
                                            style={ { marginRight: 16 } }
                                        >
                                            <div
                                                className='product-quantity'
                                                style={ {
                                                    gap: 14,
                                                    fontSize: 13,
                                                    display: 'flex',
                                                    fontWeight: 600,
                                                    color: '#073B4C',
                                                } }
                                            >
                                                <span className='sgsb-minus-icon'>-</span>
                                                <span className='product-count'>1</span>
                                                <span className='sgsb-plus-icon'>+</span>
                                            </div>
                                        </div>
                                    ) }

                                    { storeData?.show_product_price && (
                                        <div className='product-subtotal'>
                                        <span
                                            className='woocommerce-Price-amount amount'
                                            style={ {
                                                fontSize: 13,
                                                fontWeight: 500,
                                                color: '#073B4C',
                                            } }
                                        >
                                            { __( '$42.00', 'storegrowth-sales-booster' ) }
                                        </span>
                                        </div>
                                    ) }

                                    { storeData?.show_remove_icon && (
                                        <div
                                            className='product-remove'
                                            style={ {
                                                padding: 7,
                                                borderRadius: 8,
                                                display: 'flex',
                                                marginLeft: 'auto',
                                                background: '#EFF2F9'
                                            } }
                                        >
                                            <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path
                                                    fill="#073B4C"
                                                    d="M8.33329 4.16667H11.6666C11.6666 3.72464 11.491 3.30072 11.1785 2.98816C10.8659 2.67559 10.442 2.5 9.99996 2.5C9.55793 2.5 9.13401 2.67559 8.82145 2.98816C8.50889 3.30072 8.33329 3.72464 8.33329 4.16667ZM7.08329 4.16667C7.08329 3.78364 7.15873 3.40437 7.30531 3.05051C7.45189 2.69664 7.66673 2.37511 7.93756 2.10427C8.2084 1.83343 8.52993 1.61859 8.8838 1.47202C9.23767 1.32544 9.61694 1.25 9.99996 1.25C10.383 1.25 10.7623 1.32544 11.1161 1.47202C11.47 1.61859 11.7915 1.83343 12.0624 2.10427C12.3332 2.37511 12.548 2.69664 12.6946 3.05051C12.8412 3.40437 12.9166 3.78364 12.9166 4.16667H17.7083C17.8741 4.16667 18.033 4.23251 18.1502 4.34973C18.2674 4.46694 18.3333 4.62591 18.3333 4.79167C18.3333 4.95743 18.2674 5.1164 18.1502 5.23361C18.033 5.35082 17.8741 5.41667 17.7083 5.41667H16.6083L15.6333 15.5092C15.5585 16.2825 15.1983 17.0002 14.623 17.5224C14.0477 18.0445 13.2985 18.3336 12.5216 18.3333H7.47829C6.70151 18.3334 5.95254 18.0442 5.37742 17.5221C4.80229 16.9999 4.44224 16.2823 4.36746 15.5092L3.39163 5.41667H2.29163C2.12587 5.41667 1.96689 5.35082 1.84968 5.23361C1.73247 5.1164 1.66663 4.95743 1.66663 4.79167C1.66663 4.62591 1.73247 4.46694 1.84968 4.34973C1.96689 4.23251 2.12587 4.16667 2.29163 4.16667H7.08329ZM8.74996 8.125C8.74996 7.95924 8.68411 7.80027 8.5669 7.68306C8.44969 7.56585 8.29072 7.5 8.12496 7.5C7.9592 7.5 7.80023 7.56585 7.68302 7.68306C7.56581 7.80027 7.49996 7.95924 7.49996 8.125V14.375C7.49996 14.5408 7.56581 14.6997 7.68302 14.8169C7.80023 14.9342 7.9592 15 8.12496 15C8.29072 15 8.44969 14.9342 8.5669 14.8169C8.68411 14.6997 8.74996 14.5408 8.74996 14.375V8.125ZM11.875 7.5C12.0407 7.5 12.1997 7.56585 12.3169 7.68306C12.4341 7.80027 12.5 7.95924 12.5 8.125V14.375C12.5 14.5408 12.4341 14.6997 12.3169 14.8169C12.1997 14.9342 12.0407 15 11.875 15C11.7092 15 11.5502 14.9342 11.433 14.8169C11.3158 14.6997 11.25 14.5408 11.25 14.375V8.125C11.25 7.95924 11.3158 7.80027 11.433 7.68306C11.5502 7.56585 11.7092 7.5 11.875 7.5ZM5.61163 15.3892C5.65657 15.853 5.87266 16.2835 6.21777 16.5968C6.56287 16.91 7.01225 17.0834 7.47829 17.0833H12.5216C12.9877 17.0834 13.437 16.91 13.7822 16.5968C14.1273 16.2835 14.3433 15.853 14.3883 15.3892L15.3533 5.41667H4.64663L5.61163 15.3892Z"
                                                />
                                            </svg>
                                        </div>
                                    ) }
                                </div>
                                <div
                                    style={ {
                                        padding: 16,
                                        marginTop: 18,
                                        display: 'flex',
                                        borderRadius: 10,
                                        background: '#FFF',
                                        alignItems: 'center',
                                        border: '1px solid #DDE6F9',
                                    } }
                                    className='woocommerce-cart-form__cart-item cart_item'
                                >
                                    { storeData?.show_product_image && (
                                        <div
                                            className='product-thumbnail'
                                            style={ { marginRight: 14 } }
                                        >
                                            <Image
                                                preview={ false }
                                                src={ PreviewImg }
                                                alt={ __( 'Product Image', 'storegrowth-sales-booster' ) }
                                            />
                                        </div>
                                    ) }

                                    <div
                                        className='product-name'
                                        style={ { marginRight: 16 } }
                                    >
                                        <div className='sgsb-product-title'>
                                            <div
                                                style={ {
                                                    fontSize: 12,
                                                    paddingTop: 3,
                                                    paddingLeft: 10,
                                                    paddingBottom: 3,
                                                    paddingRight: 10,
                                                    borderRadius: 10,
                                                    color: '#35606f',
                                                    display: 'inline',
                                                    background: '#EFF2F9'
                                                } }
                                                className='sgsb-product-category'
                                            >
                                                { __( 'Hoodies', 'storegrowth-sales-booster' ) }
                                            </div>
                                            <div
                                                style={ {
                                                    fontSize: 14,
                                                    marginTop: 5,
                                                    fontWeight: 500,
                                                    color: '#073B4C',
                                                } }
                                                className='sgsb-product-name'
                                            >
                                                { __( 'Hoodie with Zipper', 'storegrowth-sales-booster' ) }
                                            </div>
                                        </div>
                                    </div>

                                    { storeData?.show_quantity_picker && (
                                        <div
                                            className='quantity'
                                            style={ { marginRight: 16 } }
                                        >
                                            <div
                                                className='product-quantity'
                                                style={ {
                                                    gap: 14,
                                                    fontSize: 13,
                                                    display: 'flex',
                                                    fontWeight: 600,
                                                    color: '#073B4C',
                                                } }
                                            >
                                                <span className='sgsb-minus-icon'>-</span>
                                                <span className='product-count'>1</span>
                                                <span className='sgsb-plus-icon'>+</span>
                                            </div>
                                        </div>
                                    ) }

                                    { storeData?.show_product_price && (
                                        <div className='product-subtotal'>
                                            <span
                                                className='woocommerce-Price-amount amount'
                                                style={ {
                                                    fontSize: 13,
                                                    fontWeight: 500,
                                                    color: '#073B4C',
                                                } }
                                            >
                                                { __( '$42.00', 'storegrowth-sales-booster' ) }
                                            </span>
                                        </div>
                                    ) }

                                    { storeData?.show_remove_icon && (
                                        <div
                                            className='product-remove'
                                            style={ {
                                                padding: 7,
                                                borderRadius: 8,
                                                display: 'flex',
                                                marginLeft: 'auto',
                                                background: '#EFF2F9'
                                            } }
                                        >
                                            <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path
                                                    fill="#073B4C"
                                                    d="M8.33329 4.16667H11.6666C11.6666 3.72464 11.491 3.30072 11.1785 2.98816C10.8659 2.67559 10.442 2.5 9.99996 2.5C9.55793 2.5 9.13401 2.67559 8.82145 2.98816C8.50889 3.30072 8.33329 3.72464 8.33329 4.16667ZM7.08329 4.16667C7.08329 3.78364 7.15873 3.40437 7.30531 3.05051C7.45189 2.69664 7.66673 2.37511 7.93756 2.10427C8.2084 1.83343 8.52993 1.61859 8.8838 1.47202C9.23767 1.32544 9.61694 1.25 9.99996 1.25C10.383 1.25 10.7623 1.32544 11.1161 1.47202C11.47 1.61859 11.7915 1.83343 12.0624 2.10427C12.3332 2.37511 12.548 2.69664 12.6946 3.05051C12.8412 3.40437 12.9166 3.78364 12.9166 4.16667H17.7083C17.8741 4.16667 18.033 4.23251 18.1502 4.34973C18.2674 4.46694 18.3333 4.62591 18.3333 4.79167C18.3333 4.95743 18.2674 5.1164 18.1502 5.23361C18.033 5.35082 17.8741 5.41667 17.7083 5.41667H16.6083L15.6333 15.5092C15.5585 16.2825 15.1983 17.0002 14.623 17.5224C14.0477 18.0445 13.2985 18.3336 12.5216 18.3333H7.47829C6.70151 18.3334 5.95254 18.0442 5.37742 17.5221C4.80229 16.9999 4.44224 16.2823 4.36746 15.5092L3.39163 5.41667H2.29163C2.12587 5.41667 1.96689 5.35082 1.84968 5.23361C1.73247 5.1164 1.66663 4.95743 1.66663 4.79167C1.66663 4.62591 1.73247 4.46694 1.84968 4.34973C1.96689 4.23251 2.12587 4.16667 2.29163 4.16667H7.08329ZM8.74996 8.125C8.74996 7.95924 8.68411 7.80027 8.5669 7.68306C8.44969 7.56585 8.29072 7.5 8.12496 7.5C7.9592 7.5 7.80023 7.56585 7.68302 7.68306C7.56581 7.80027 7.49996 7.95924 7.49996 8.125V14.375C7.49996 14.5408 7.56581 14.6997 7.68302 14.8169C7.80023 14.9342 7.9592 15 8.12496 15C8.29072 15 8.44969 14.9342 8.5669 14.8169C8.68411 14.6997 8.74996 14.5408 8.74996 14.375V8.125ZM11.875 7.5C12.0407 7.5 12.1997 7.56585 12.3169 7.68306C12.4341 7.80027 12.5 7.95924 12.5 8.125V14.375C12.5 14.5408 12.4341 14.6997 12.3169 14.8169C12.1997 14.9342 12.0407 15 11.875 15C11.7092 15 11.5502 14.9342 11.433 14.8169C11.3158 14.6997 11.25 14.5408 11.25 14.375V8.125C11.25 7.95924 11.3158 7.80027 11.433 7.68306C11.5502 7.56585 11.7092 7.5 11.875 7.5ZM5.61163 15.3892C5.65657 15.853 5.87266 16.2835 6.21777 16.5968C6.56287 16.91 7.01225 17.0834 7.47829 17.0833H12.5216C12.9877 17.0834 13.437 16.91 13.7822 16.5968C14.1273 16.2835 14.3433 15.853 14.3883 15.3892L15.3533 5.41667H4.64663L5.61163 15.3892Z"
                                                />
                                            </svg>
                                        </div>
                                    ) }
                                </div>
                            </div>
                        </div>

                        <div className='sgsb-cart-collaterals cart-collaterals'>
                            { storeData?.show_coupon && (
                                <div className='product-coupon'>
                                    <label
                                        className={ 'promo-label' }
                                        style={ {
                                            gap: 8,
                                            fontSize: 15,
                                            fontWeight: 500,
                                            marginBottom: 4,
                                            display: 'flex',
                                            color: '#073B4C',
                                        } }
                                    >
                                        { __( 'Promo Code', 'storegrowth-sales-booster' ) }
                                        { !sgsbAdmin.isPro && <UpgradeCrown /> }
                                    </label>
                                    <div
                                        className='coupon-field'
                                        style={ {
                                            gap: 10,
                                            display: 'flex',
                                            alignItems: 'center',
                                        } }
                                    >
                                        <input
                                            disabled
                                            type='text'
                                            placeholder={ __( 'Type here', 'storegrowth-sales-booster' ) }
                                            style={ {
                                                flex: 2,
                                                fontSize: 14,
                                                width: '100%',
                                                paddingTop: 6,
                                                fontWeight: 300,
                                                borderRadius: 6,
                                                paddingLeft: 16,
                                                paddingRight: 16,
                                                paddingBottom: 6,
                                                background: '#fff',
                                                fontStyle: 'italic',
                                            } }
                                        />
                                        <div
                                            className={ 'coupon-button' }
                                            style={ {
                                                fontSize: 14,
                                                color: '#FFF',
                                                paddingTop: 10,
                                                borderRadius: 6,
                                                paddingLeft: 18,
                                                fontWeight: 600,
                                                paddingRight: 18,
                                                paddingBottom: 10,
                                                background: storeData?.buttons_bg_color,
                                            } }
                                        >
                                            { __( 'Apply Now', 'storegrowth-sales-booster' ) }
                                        </div>
                                    </div>
                                </div>
                            ) }
                            <div className='cart_totals '>
                                <div className='shop_table shop_table_responsive'>
                                    <div
                                        className='shop-table-body'
                                        style={ {
                                            marginTop: 30,
                                            marginBottom: 30
                                        } }
                                    >
                                        <div
                                            className='cart-subtotal'
                                            style={ {
                                                fontSize: 16,
                                                display: 'flex',
                                                fontWeight: 500,
                                                marginBottom: 6,
                                                color: '#345f6f',
                                                justifyContent: 'space-between',
                                            } }
                                        >
                                            <div>{ __( 'Subtotal', 'storegrowth-sales-booster' ) }</div>
                                            <div data-title='Subtotal'>
                                            <span className='woocommerce-Price-amount amount'>
                                                { __( '$126.00', 'storegrowth-sales-booster' ) }
                                            </span>
                                            </div>
                                        </div>
                                        <div
                                            className='order-total'
                                            style={ {
                                                fontSize: 15,
                                                display: 'flex',
                                                color: '#073B4C',
                                                justifyContent: 'space-between',
                                            } }
                                        >
                                            <div style={ { fontWeight: 600 } }>
                                                { __( 'Total', 'storegrowth-sales-booster' ) }
                                            </div>
                                            <div data-title='Total'>
                                                <strong>
                                                <span className='woocommerce-Price-amount amount'>
                                                    { __( '$126.00', 'storegrowth-sales-booster' ) }
                                                </span>
                                                </strong>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className='wc-proceed-to-checkout'>
                                    <div
                                        className='sgsb-cart-widget-buttons'
                                        style={ {
                                            gap: 16,
                                            display: 'flex',
                                        } }
                                    >
                                        <div
                                            className='sgsb-cart-widget-shooping-button sgsb-cart-widget-close'
                                            style={ {
                                                fontSize: 16,
                                                width: '100%',
                                                color: '#fff',
                                                paddingTop: 12,
                                                borderRadius: 6,
                                                fontWeight: 600,
                                                paddingBottom: 12,
                                                textAlign: 'center',
                                                background: storeData?.shopping_button_bg_color,
                                            } }
                                        >
                                            { __( 'Keep Shopping', 'storegrowth-sales-booster' ) }
                                        </div>
                                        <div
                                            className='sgsb-cart-widget-checkout-button'
                                            style={ {
                                                fontSize: 16,
                                                width: '100%',
                                                color: '#fff',
                                                paddingTop: 12,
                                                borderRadius: 6,
                                                fontWeight: 600,
                                                paddingBottom: 12,
                                                textAlign: 'center',
                                                background: storeData?.buttons_bg_color,
                                            } }
                                        >
                                            { __( 'Checkout', 'storegrowth-sales-booster' ) }
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div
                className='cart-icon-section'
                style={ {
                    marginTop: 30,
                    marginBottom: 100,
                    textAlign: 'right',
                } }
            >
                <CartIcon
                    svgStyle={ {
                        width: 55,
                        height: 50,
                        padding: 16,
                        borderRadius: 10,
                        background: storeData?.buttons_bg_color,
                    } }
                    activeIcon={ true }
                    iconName={ storeData?.icon_name }
                    iconColor={ storeData?.icon_color }
                />
            </div>
        </Fragment>
    );
}

export default Preview;
