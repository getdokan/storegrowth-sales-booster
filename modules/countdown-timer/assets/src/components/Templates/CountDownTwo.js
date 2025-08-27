import React from 'react';
import { __ } from '@wordpress/i18n';

const CountDownTwo = () => {
    return (
        <div
            className='sgsb-countdown-timer ct-layout-2'
            style={ {
                width        : '100%',
                height       : '100%',
                padding      : '15px 40px 10px',
                background   : 'linear-gradient(180deg, aliceblue 70%, #eff8ff 0%)',
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
                    { __( '50% OFF', 'storegrowth-sales-booster' ) }
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
                            padding       : '14px 0',
                            fontSize      : 12,
                            textAlign     : 'center',
                            borderRadius  : 8,
                            letterSpacing : 2,
                            textTransform : 'uppercase',
                        } }
                    >
                        <strong
                            className='sgsb-countdown-timer-item-days'
                            style={ {
                                display    : 'block',
                                fontSize   : 24,
                                lineHeight : .75,
                                fontWeight : 500,
                                fontFamily : 'Merienda',
                            } }
                        >
                            { __( '03', 'storegrowth-sales-booster' ) }
                        </strong>
                        <span style={ { fontFamily : 'Merienda' } }>
                            { __( 'Days', 'storegrowth-sales-booster' ) }
                        </span>
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
                            padding       : '14px 0',
                            fontSize      : 12,
                            textAlign     : 'center',
                            borderRadius  : 8,
                            letterSpacing : 2,
                            textTransform : 'uppercase',
                        } }
                    >
                        <strong
                            className='sgsb-countdown-timer-item-hours'
                            style={ {
                                display    : 'block',
                                fontSize   : 24,
                                lineHeight : .75,
                                fontWeight : 500,
                                fontFamily : 'Merienda',
                            } }
                        >
                            { __( '21', 'storegrowth-sales-booster' ) }
                        </strong>
                        <span style={ { fontFamily : 'Merienda' } }>
                            { __( 'Hours', 'storegrowth-sales-booster' ) }
                        </span>
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
                            padding       : '14px 0',
                            fontSize      : 12,
                            textAlign     : 'center',
                            borderRadius  : 8,
                            letterSpacing : 2,
                            textTransform : 'uppercase',
                        } }
                    >
                        <strong
                            className='sgsb-countdown-timer-item-minutes'
                            style={ {
                                display    : 'block',
                                fontSize   : 24,
                                lineHeight : .75,
                                fontWeight : 500,
                                fontFamily : 'Merienda',
                            } }
                        >
                            { __( '02', 'storegrowth-sales-booster' ) }
                        </strong>
                        <span style={ { fontFamily : 'Merienda' } }>
                            { __( 'Min', 'storegrowth-sales-booster' ) }
                        </span>
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
                            padding       : '14px 0',
                            fontSize      : 12,
                            textAlign     : 'center',
                            borderRadius  : 8,
                            letterSpacing : 2,
                            textTransform : 'uppercase',
                        } }
                    >
                        <strong
                            className='sgsb-countdown-timer-item-seconds'
                            style={ {
                                display    : 'block',
                                fontSize   : 24,
                                lineHeight : .75,
                                fontWeight : 500,
                                fontFamily : 'Merienda',
                            } }
                        >
                            { __( '33', 'storegrowth-sales-booster' ) }
                        </strong>
                        <span style={ { fontFamily : 'Merienda' } }>
                            { __( 'Sec', 'storegrowth-sales-booster' ) }
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CountDownTwo;
