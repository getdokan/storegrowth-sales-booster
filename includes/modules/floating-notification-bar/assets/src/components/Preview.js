import React from 'react';
import {extractedTitle} from "sales-booster/src/utils/helper";
import {__} from "@wordpress/i18n";
import BarIcon from "./BarIcon";

const Preview = ( { isProActive, formData, fontFamily } ) => {

    const bannerStyle = {
        color           : formData.text_color,
        height          : formData.banner_height,
        display         : 'flex',
        padding         : '2px 20px',
        alignItems      : 'center',
        borderRadius    : '5px',
        justifyContent  : 'space-between',
        backgroundColor : formData.background_color,
    };

    const getLabelByValue = ( value, object ) => {
        const font = object.find( ( font ) => font.value === value );
        return font ? font.label : '';
    };

    const selectedFont = getLabelByValue( formData.font_family, fontFamily );

    return (
        <div className='sgsb-pd-banner-bar-wrapper'>
            <div className='sgsb-pd-banner-bar' style={ bannerStyle }>
                <div style={{ display: 'flex', alignItems: 'center', fontSize: '24px', color: '#000', padding: '2px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', fontSize: '24px', color: '#000', padding: '2px' }}>
                        { isProActive && formData?.default_banner_custom_icon ? (
                            <img
                                width='32'
                                height='32'
                                src={ formData?.default_banner_custom_icon }
                                alt={ __( 'Custom Icon', 'storegrowth-sales-booster' ) }
                            />
                        ) : (
                            <BarIcon
                                preview={ true }
                                activeIcon={ formData?.default_banner_icon_name }
                                iconName={ formData?.default_banner_icon_name }
                                iconColor={formData?.icon_color}
                            />
                        ) }
                    </div>
                </div>
                <span
                    className='sgsb-pd-banner-text'
                    style={{
                        textAlign: 'center',
                        fontFamily: selectedFont,
                        fontSize: formData.font_size,
                    }}
                >
                    { extractedTitle( formData?.default_banner_text, 12 ) }
                </span>
                { formData.countdown_show_enable && 
                    <div
                        className='sgsb-fn-bar-countdown'
                        style={ {
                            gap        : 10,
                            display    : 'flex',
                            fontSize   : 14,
                            fontWeight : 700,
                        } }
                    >
                        <div
                            className='sgsb-fn-bar-countdown-value'
                            style={ {
                                gap           : 8,
                                display       : 'flex',
                                lineHeight    : 1,
                                flexDirection : 'column',
                            } }
                        >
                        <span className='sgsb-countdown-value days'>
                            { __( '21', 'storegrowth-sales-booster' ) }
                        </span>
                            <span
                                className='sgsb-countdown-content'
                                style={ {
                                    fontSize   : 10,
                                    fontWeight : 400,
                                } }
                            >
                            { __( 'DAY', 'storegrowth-sales-booster' ) }
                        </span>
                        </div>
                        <div
                            className='sgsb-fn-bar-countdown-value'
                            style={ {
                                gap           : 8,
                                lineHeight    : 1,
                                display       : 'flex',
                                flexDirection : 'column',
                            } }
                        >
                            { __( '10', 'storegrowth-sales-booster' ) }
                            <span
                                className='sgsb-countdown-content'
                                style={ {
                                    fontSize   : 10,
                                    fontWeight : 400,
                                } }
                            >
                            { __( 'HRS', 'storegrowth-sales-booster' ) }
                        </span>
                        </div>
                        <div
                            className='sgsb-fn-bar-countdown-value'
                            style={ {
                                gap           : 8,
                                lineHeight    : 1,
                                display       : 'flex',
                                flexDirection : 'column',
                            } }
                        >
                        <span className='sgsb-countdown-value minutes'>
                            { __( '36', 'storegrowth-sales-booster' ) }
                        </span>
                            <span
                                className='sgsb-countdown-content'
                                style={ {
                                    fontSize   : 10,
                                    fontWeight : 400,
                                } }
                            >
                            { __( 'MIN', 'storegrowth-sales-booster' ) }
                        </span>
                        </div>
                        <div
                            className='sgsb-fn-bar-countdown-value'
                            style={ {
                                gap           : 8,
                                lineHeight    : 1,
                                display       : 'flex',
                                flexDirection : 'column',
                            } }
                        >
                        <span className='sgsb-countdown-value seconds'>
                            { __( '20', 'storegrowth-sales-booster' ) }
                        </span>
                            <span
                                className='sgsb-countdown-content'
                                style={ {
                                    fontSize   : 10,
                                    fontWeight : 400,
                                } }
                            >
                            SEC
                        </span>
                        </div>
                    </div>
                }
                <span
                    className='fn-bar-action-button'
                    style={ {
                        color           : formData.button_text_color,
                        padding         : '7px 11px',
                        fontSize        : 12,
                        fontWeight      : 600,
                        borderRadius    : '5px',
                        backgroundColor : formData.button_color,
                    } }
                >
                    { __( formData.ac_button_text, 'storegrowth-sales-booster' ) }
                </span>
                <div
                    className='sgsb-pd-banner-bar-remove'
                    style={{
                        display    : 'flex',
                        alignItems : 'center',
                    }}
                >
                    <svg
                        width='16'
                        height='16'
                        fill='none'
                        viewBox='0 0 16 16'
                        style={{
                            width    : '16px',
                            height   : '16px',
                            position : 'relative'
                        }}
                    >
                        <g clipPath='url(#clip0_986_746)'>
                            <path
                                fill={ formData?.close_icon_color }
                                d='M0.781396 16.0001C0.626858 16.0001 0.475783 15.9543 0.347281 15.8685C0.218778 15.7826 0.118621 15.6606 0.0594776 15.5178C0.000334661 15.3751 -0.0151369 15.218 0.0150198 15.0664C0.0451766 14.9148 0.119607 14.7756 0.228896 14.6664L14.6664 0.228853C14.8129 0.0823209 15.0117 0 15.2189 0C15.4261 0 15.6249 0.0823209 15.7714 0.228853C15.9179 0.375385 16.0002 0.574125 16.0002 0.781353C16.0002 0.988581 15.9179 1.18732 15.7714 1.33385L1.3339 15.7714C1.26141 15.844 1.17528 15.9016 1.08047 15.9408C0.985653 15.9801 0.884016 16.0002 0.781396 16.0001Z'
                            />
                            <path
                                fill={ formData?.close_icon_color }
                                d='M15.2189 16.0001C15.1162 16.0002 15.0146 15.9801 14.9198 15.9408C14.825 15.9016 14.7388 15.844 14.6664 15.7714L0.228853 1.33385C0.0823209 1.18732 0 0.988581 0 0.781353C0 0.574125 0.0823209 0.375385 0.228853 0.228853C0.375385 0.0823209 0.574125 0 0.781353 0C0.988581 0 1.18732 0.0823209 1.33385 0.228853L15.7714 14.6664C15.8806 14.7756 15.9551 14.9148 15.9852 15.0664C16.0154 15.218 15.9999 15.3751 15.9408 15.5178C15.8816 15.6606 15.7815 15.7826 15.653 15.8685C15.5245 15.9543 15.3734 16.0001 15.2189 16.0001Z'
                            />
                        </g>
                        <defs>
                            <clipPath id='clip0_986_746'>
                                <rect width='16' height='16' fill='white' />
                            </clipPath>
                        </defs>
                    </svg>
                </div>
            </div>
        </div>
    );
};

export default Preview;
