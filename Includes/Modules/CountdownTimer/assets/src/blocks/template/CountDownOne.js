import React from 'react';
import { __ } from '@wordpress/i18n';

const CountDownOne = ({attributes}) => {

   const  {discountText,startDate,endDate} = attributes;
    return (
        <div
            className='sgsb-countdown-timer ct-layout-1'
            style={ {
                margin       : '0 auto',
                padding      : '16px 40px 14px',
                borderRadius : 8,
                border       : `1px solid ${attributes?.borderColor}`,
                background   : `${attributes?.backgroundColor}`
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
                        color      : `${attributes?.headingColor}`,
                        margin     : '0 0 10px 0',
                        fontSize   : 40,
                        textAlign  : 'center',
                        fontWeight : 600,
                        lineHeight : 1.2,
                    } }
                >
                    { __( `${discountText}`, 'storegrowth-sales-booster' ) }
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
                            border        : '1px solid #ECEDF0',
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
                                color      : '#1B1B50',
                                display    : 'block',
                                fontSize   : 24,
                                lineHeight : .75,
                                fontWeight : 500,
                            } }
                        >
                            { __( '03', 'storegrowth-sales-booster' ) }
                        </strong>
                        <span>{ __( 'Days', 'storegrowth-sales-booster' ) }</span>
                    </div>
                    <span
                        className='sgsb-colon ct-layout-1'
                        style={ {
                            color      : '#008DFF',
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
                            border        : '1px solid #ECEDF0',
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
                                color      : '#1B1B50',
                                display    : 'block',
                                fontSize   : 24,
                                lineHeight : .75,
                                fontWeight : 500,
                            } }
                        >
                            { __( '21', 'storegrowth-sales-booster' ) }
                        </strong>
                        <span>{ __( 'Hours', 'storegrowth-sales-booster' ) }</span>
                    </div>
                    <span
                        className='sgsb-colon ct-layout-1'
                        style={ {
                            color      : '#008DFF',
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
                            border        : '1px solid #ECEDF0',
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
                                color      : '#1B1B50',
                                display    : 'block',
                                fontSize   : 24,
                                lineHeight : .75,
                                fontWeight : 500,
                            } }
                        >
                            { __( '02', 'storegrowth-sales-booster' ) }
                        </strong>
                        <span>{ __( 'Min', 'storegrowth-sales-booster' ) }</span>
                    </div>
                    <span
                        className='sgsb-colon ct-layout-1'
                        style={ {
                            color      : '#008DFF',
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
                            border        : '1px solid #ECEDF0',
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
                                color      : '#1B1B50',
                                display    : 'block',
                                fontSize   : 24,
                                lineHeight : .75,
                                fontWeight : 500,
                            } }
                        >
                            { __( '33', 'storegrowth-sales-booster' ) }
                        </strong>
                        <span>{ __( 'Sec', 'storegrowth-sales-booster' ) }</span>
                    </div>
                </div>
            </div>

        </div>
    );
}

export default CountDownOne;
