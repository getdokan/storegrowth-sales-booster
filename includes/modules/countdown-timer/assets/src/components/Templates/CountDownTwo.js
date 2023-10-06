import React from 'react';
import { __ } from '@wordpress/i18n';

const CountDownTwo = () => {
    return (
        <div className='sgsb-countdown-timer ct-layout-2'>
            <div className='sgsb-countdown-timer-wrapper'>
                <p className='sgsb-countdown-timer-heading ct-layout-2'>
                    { __( '50% OFF', 'storegrowth-sales-booster' ) }
                </p>
                <div className='sgsb-countdown-timer-items ct-layout-2' data-end-date='2023-10-10 23:59:59'>
                    <div className='sgsb-countdown-timer-item ct-layout-2'>
                        <strong className='sgsb-countdown-timer-item-days'>
                            { __( '03', 'storegrowth-sales-booster' ) }
                        </strong>
                        <span>{ __( 'Days', 'storegrowth-sales-booster' ) }</span>
                    </div>
                    <span className='sgsb-colon ct-layout-2'>:</span>
                    <div className='sgsb-countdown-timer-item ct-layout-2'>
                        <strong className='sgsb-countdown-timer-item-hours'>
                            { __( '21', 'storegrowth-sales-booster' ) }
                        </strong>
                        <span>{ __( 'Hours', 'storegrowth-sales-booster' ) }</span>
                    </div>
                    <span className='sgsb-colon ct-layout-2'>:</span>
                    <div className='sgsb-countdown-timer-item ct-layout-2'>
                        <strong className='sgsb-countdown-timer-item-minutes'>
                            { __( '02', 'storegrowth-sales-booster' ) }
                        </strong>
                        <span>{ __( 'Min', 'storegrowth-sales-booster' ) }</span>
                    </div>
                    <span className='sgsb-colon ct-layout-2'>:</span>
                    <div className='sgsb-countdown-timer-item ct-layout-2'>
                        <strong className='sgsb-countdown-timer-item-seconds'>
                            { __( '33', 'storegrowth-sales-booster' ) }
                        </strong>
                        <span>{ __( 'Sec', 'storegrowth-sales-booster' ) }</span>
                    </div>
                </div>
            </div>

        </div>
    );
}

export default CountDownTwo;
