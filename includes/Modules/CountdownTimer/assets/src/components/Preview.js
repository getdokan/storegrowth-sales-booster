import React, {Fragment} from 'react'
import {__} from "@wordpress/i18n";

const Preview = ( { formData } ) => {

    const dynamicText = formData.countdown_heading.replace(
        '[discount]',
        50
    );
    
    return (
        <Fragment>
            { formData?.selected_theme === 'ct-layout-1' && (
                <div
                    className='sgsb-countdown-timer ct-layout-1'
                    style={ {
                        width        : '100%',
                        margin       : '0 auto',
                        border       : `1px solid ${ formData?.border_color }`,
                        padding      : '16px 40px 14px',
                        background   : formData?.widget_background_color,
                        borderRadius : 8
                    } }
                >
                    <div
                        className='sgsb-countdown-timer-wrapper'
                        style={ {
                            display       : 'flex',
                            alignItems    : 'center',
                            flexDirection : 'column',
                        } }
                    >
                        <p
                            className='sgsb-countdown-timer-heading ct-layout-1'
                            style={ {
                                color      : formData?.heading_text_color,
                                margin     : '0 0 10px 0',
                                fontSize   : 40,
                                textAlign  : 'center',
                                fontWeight : 600,
                                lineHeight : 1.2,
                            } }
                        >
                            { __( dynamicText, 'storegrowth-sales-booster' ) }
                        </p>
                        <div
                            data-end-date='2023-10-10 23:59:59'
                            className='sgsb-countdown-timer-items ct-layout-1'
                            style={ {
                                display        : 'flex',
                                marginBottom   : 10,
                                justifyContent : 'center',
                            } }
                        >
                            <div
                                className='sgsb-countdown-timer-item ct-layout-1'
                                style={ {
                                    color         : '#989FAB',
                                    width         : 64,
                                    height        : 64,
                                    border        : `1px solid #ecedf0`,
                                    fontSize      : 12,
                                    textAlign     : 'center',
                                    paddingTop    : 12,
                                    borderRadius  : 8,
                                    letterSpacing : 2,
                                    textTransform : 'uppercase',
                                } }
                            >
                                <strong
                                    className='sgsb-countdown-timer-item-days'
                                    style={ {
                                        color        : '#1B1B50',
                                        display      : 'block',
                                        fontSize     : 24,
                                        lineHeight   : .75,
                                        fontWeight   : 500,
                                        marginBottom : 6,
                                    } }
                                >
                                    { __( '03', 'storegrowth-sales-booster' ) }
                                </strong>
                                <span>{ __( 'Days', 'storegrowth-sales-booster' ) }</span>
                            </div>
                            <span
                                className='sgsb-colon ct-layout-1'
                                style={ {
                                    color      : formData?.heading_text_color,
                                    margin     : '0 14px',
                                    lineHeight : 4,
                                } }
                            >:</span>
                            <div
                                className='sgsb-countdown-timer-item ct-layout-1'
                                style={ {
                                    width         : 64,
                                    color         : '#989FAB',
                                    height        : 64,
                                    border        : `1px solid #ecedf0`,
                                    fontSize      : 12,
                                    textAlign     : 'center',
                                    paddingTop    : 12,
                                    borderRadius  : 8,
                                    letterSpacing : 2,
                                    textTransform : 'uppercase',
                                } }
                            >
                                <strong
                                    className='sgsb-countdown-timer-item-hours'
                                    style={ {
                                        color        : '#1B1B50',
                                        display      : 'block',
                                        fontSize     : 24,
                                        lineHeight   : .75,
                                        fontWeight   : 500,
                                        marginBottom : 6,
                                    } }
                                >
                                    { __( '21', 'storegrowth-sales-booster' ) }
                                </strong>
                                <span>{ __( 'Hours', 'storegrowth-sales-booster' ) }</span>
                            </div>
                            <span
                                className='sgsb-colon ct-layout-1'
                                style={ {
                                    color      : formData?.heading_text_color,
                                    margin     : '0 14px',
                                    lineHeight : 4,
                                } }
                            >:</span>
                            <div
                                className='sgsb-countdown-timer-item ct-layout-1'
                                style={ {
                                    width         : 64,
                                    color         : '#989FAB',
                                    height        : 64,
                                    border        : `1px solid #ecedf0`,
                                    fontSize      : 12,
                                    textAlign     : 'center',
                                    paddingTop    : 12,
                                    borderRadius  : 8,
                                    letterSpacing : 2,
                                    textTransform : 'uppercase',
                                } }
                            >
                                <strong
                                    className='sgsb-countdown-timer-item-minutes'
                                    style={ {
                                        color        : '#1B1B50',
                                        display      : 'block',
                                        fontSize     : 24,
                                        lineHeight   : .75,
                                        fontWeight   : 500,
                                        marginBottom : 6,
                                    } }
                                >
                                    { __( '02', 'storegrowth-sales-booster' ) }
                                </strong>
                                <span>{ __( 'Min', 'storegrowth-sales-booster' ) }</span>
                            </div>
                            <span
                                className='sgsb-colon ct-layout-1'
                                style={ {
                                    color      : formData?.heading_text_color,
                                    margin     : '0 14px',
                                    lineHeight : 4,
                                } }
                            >:</span>
                            <div
                                className='sgsb-countdown-timer-item ct-layout-1'
                                style={ {
                                    width         : 64,
                                    color         : '#989FAB',
                                    height        : 64,
                                    border        : `1px solid #ecedf0`,
                                    fontSize      : 12,
                                    textAlign     : 'center',
                                    paddingTop    : 12,
                                    borderRadius  : 8,
                                    letterSpacing : 2,
                                    textTransform : 'uppercase',
                                } }
                            >
                                <strong
                                    className='sgsb-countdown-timer-item-seconds'
                                    style={ {
                                        color        : '#1B1B50',
                                        display      : 'block',
                                        fontSize     : 24,
                                        lineHeight   : .75,
                                        fontWeight   : 500,
                                        marginBottom : 6,
                                    } }
                                >
                                    { __( '33', 'storegrowth-sales-booster' ) }
                                </strong>
                                <span>{ __( 'Sec', 'storegrowth-sales-booster' ) }</span>
                            </div>
                        </div>
                    </div>
                </div>
            ) }

            { formData?.selected_theme === 'ct-layout-2' && (
                <div
                    className='sgsb-countdown-timer ct-layout-2'
                    style={ {
                        width        : '100%',
                        height       : '100%',
                        border       : `1px solid ${ formData?.border_color }`,
                        padding      : '15px 40px 10px',
                        background   : formData?.widget_background_color,
                        marginBottom : 25,
                        borderRadius : 8,
                    } }
                >
                    <div
                        className='sgsb-countdown-timer-wrapper'
                        style={ {
                            display       : 'flex',
                            alignItems    : 'center',
                            flexDirection : 'column',
                        } }
                    >
                        <p
                            className='sgsb-countdown-timer-heading ct-layout-2'
                            style={ {
                                margin               : '0 0 10px 0',
                                fontSize             : 40,
                                textAlign            : 'center',
                                fontWeight           : 600,
                                background           : 'linear-gradient(90deg, #32DBBE 0%, #008DFF 100%)',
                                lineHeight           : 1.2,
                                fontFamily           : 'Merienda',
                                webkitTextFillColor  : 'transparent',
                                webkitBackgroundClip : 'text',
                            } }
                        >
                            { __( dynamicText, 'storegrowth-sales-booster' ) }
                        </p>
                        <div
                            className='sgsb-countdown-timer-items ct-layout-2'
                            data-end-date='2023-10-10 23:59:59'
                            style={ {
                                color          : '#fff',
                                width          : 'fit-content',
                                display        : 'flex',
                                boxShadow      : '0px 12px 48px 0px rgba(27, 27, 80, 0.10)',
                                background     : 'var(--gradient, linear-gradient(90deg, #32DBBE 0%, #008DFF 100%))',
                                marginBottom   : 10,
                                borderRadius   : 6,
                                justifyContent : 'center',
                            } }
                        >
                            <div
                                className='sgsb-countdown-timer-item ct-layout-2'
                                style={ {
                                    width         : 64,
                                    height        : 64,
                                    fontSize      : 12,
                                    textAlign     : 'center',
                                    paddingTop    : 12,
                                    
                                    borderRadius  : 8,
                                    letterSpacing : 2,
                                    textTransform : 'uppercase',
                                } }
                            >
                                <strong
                                    className='sgsb-countdown-timer-item-days'
                                    style={ {
                                        display      : 'block',
                                        fontSize     : 24,
                                        lineHeight   : .75,
                                        fontWeight   : 500,
                                        marginBottom : 6,
                                    } }
                                >
                                    { __( '03', 'storegrowth-sales-booster' ) }
                                </strong>
                                <span>{ __( 'Days', 'storegrowth-sales-booster' ) }</span>
                            </div>
                            <span
                                className='sgsb-colon ct-layout-2'
                                style={ {
                                    margin     : '0 14px',
                                    lineHeight : 4,
                                } }
                            >:</span>
                            <div
                                className='sgsb-countdown-timer-item ct-layout-2'
                                style={ {
                                    width         : 64,
                                    height        : 64,
                                    fontSize      : 12,
                                    textAlign     : 'center',
                                    
                                    paddingTop    : 12,
                                    borderRadius  : 8,
                                    letterSpacing : 2,
                                    textTransform : 'uppercase',
                                } }
                            >
                                <strong
                                    className='sgsb-countdown-timer-item-hours'
                                    style={ {
                                        display      : 'block',
                                        fontSize     : 24,
                                        lineHeight   : .75,
                                        fontWeight   : 500,
                                        marginBottom : 6,
                                    } }
                                >
                                    { __( '21', 'storegrowth-sales-booster' ) }
                                </strong>
                                <span>{ __( 'Hours', 'storegrowth-sales-booster' ) }</span>
                            </div>
                            <span
                                className='sgsb-colon ct-layout-2'
                                style={ {
                                    margin     : '0 14px',
                                    lineHeight : 4,
                                } }
                            >:</span>
                            <div
                                className='sgsb-countdown-timer-item ct-layout-2'
                                style={ {
                                    width         : 64,
                                    height        : 64,
                                    fontSize      : 12,
                                    textAlign     : 'center',
                                    
                                    paddingTop    : 12,
                                    borderRadius  : 8,
                                    letterSpacing : 2,
                                    textTransform : 'uppercase',
                                } }
                            >
                                <strong
                                    className='sgsb-countdown-timer-item-minutes'
                                    style={ {
                                        display      : 'block',
                                        fontSize     : 24,
                                        lineHeight   : .75,
                                        fontWeight   : 500,
                                        marginBottom : 6,
                                    } }
                                >
                                    { __( '02', 'storegrowth-sales-booster' ) }
                                </strong>
                                <span>{ __( 'Min', 'storegrowth-sales-booster' ) }</span>
                            </div>
                            <span
                                className='sgsb-colon ct-layout-2'
                                style={ {
                                    margin     : '0 14px',
                                    lineHeight : 4,
                                } }
                            >:</span>
                            <div
                                className='sgsb-countdown-timer-item ct-layout-2'
                                style={ {
                                    width         : 64,
                                    height        : 64,
                                    fontSize      : 12,
                                    textAlign     : 'center',
                                    
                                    paddingTop    : 12,
                                    borderRadius  : 8,
                                    letterSpacing : 2,
                                    textTransform : 'uppercase',
                                } }
                            >
                                <strong
                                    className='sgsb-countdown-timer-item-seconds'
                                    style={ {
                                        display      : 'block',
                                        fontSize     : 24,
                                        lineHeight   : .75,
                                        fontWeight   : 500,
                                        marginBottom : 6,
                                    } }
                                >
                                    { __( '33', 'storegrowth-sales-booster' ) }
                                </strong>
                                <span>{ __( 'Sec', 'storegrowth-sales-booster' ) }</span>
                            </div>
                        </div>
                    </div>

                </div>
            ) }
        </Fragment>
    )
}

export default Preview