import React from 'react';
import { __ } from '@wordpress/i18n';

const NotifyBarOne = ({coutdownEnable}) => {
    return (
        <div
            style={{
                color           : '#ffffff',
                width           : '100%',
                height          : 60,
                display         : 'flex',
                padding         : '18px',
                fontSize        : '16px',
                position        : 'absolute',
                textAlign       : 'center',
                alignItems      : 'center',
                borderRadius    : '5px',
                flexDirection   : 'row',
                justifyContent  : 'space-between',
                backgroundColor : '#0875FF',
            }}
        >
            <svg
                width='20'
                height='20'
                viewBox='0 0 200 200'
                style={{
                    width      : '32px',
                    height     : '32px',
                    position   : 'relative',
                    overflow   : 'hidden',
                    flexShrink : '0',
                }}
            >
                <g>
                    <path
                        fill={ '#fff' }
                        d='M72.8,172.4c0.9,0,1.8-0.3,2.5-1l54.5-54.5c1.4-1.4,1.4-3.6,0-4.9c-1.4-1.4-3.6-1.4-4.9,0l-54.5,54.5   c-1.4,1.4-1.4,3.6,0,4.9C71,172.1,71.9,172.4,72.8,172.4z'
                    />
                    <path
                        fill={ '#fff' }
                        d='M91.3,131.5c3.6,0,7.2-1.4,10-4.1c2.7-2.7,4.1-6.2,4.1-10c0-3.8-1.5-7.3-4.1-10c-2.7-2.7-6.2-4.1-10-4.1   c-3.8,0-7.3,1.5-10,4.1c-2.7,2.7-4.1,6.2-4.1,10c0,3.8,1.5,7.3,4.1,10C84.1,130.1,87.7,131.5,91.3,131.5z M86.3,112.4L86.3,112.4   c1.3-1.3,3.1-2.1,5-2.1s3.7,0.7,5,2.1c1.3,1.3,2.1,3.1,2.1,5c0,1.9-0.7,3.7-2.1,5c-2.8,2.8-7.3,2.8-10,0c-1.3-1.3-2.1-3.1-2.1-5   C84.2,115.5,84.9,113.7,86.3,112.4z'
                    />
                    <path
                        fill={ '#fff' }
                        d='M98.8,155.9c-2.7,2.7-4.1,6.2-4.1,10s1.5,7.3,4.1,10c2.7,2.7,6.2,4.1,10,4.1c3.8,0,7.3-1.5,10-4.1c5.5-5.5,5.5-14.4,0-19.9   C113.2,150.4,104.3,150.4,98.8,155.9z M113.7,170.9c-1.3,1.3-3.1,2.1-5,2.1c-1.9,0-3.7-0.7-5-2.1s-2.1-3.1-2.1-5s0.7-3.7,2.1-5   c1.4-1.4,3.2-2.1,5-2.1c1.8,0,3.6,0.7,5,2.1c1.3,1.3,2.1,3.1,2.1,5S115.1,169.6,113.7,170.9z'
                    />
                    <path
                        fill={ '#fff' }
                        d='M185,54.7h-41.5c6-5.2,9.7-12.8,9.7-21.4c0-15.6-12.7-28.4-28.4-28.4c-10.7,0-20,6-24.9,14.7C95.2,11,85.8,5,75.1,5   C59.5,5,46.8,17.7,46.8,33.4c0,8.5,3.8,16.2,9.7,21.4H15c-5.2,0-9.5,4.3-9.5,9.5v21.6c0,5.2,4.3,9.5,9.5,9.5h2.6v86.2   c0,7.4,6.1,13.5,13.5,13.5h137.9c7.4,0,13.5-6.1,13.5-13.5V95.3h2.6c5.2,0,9.5-4.3,9.5-9.5V64.2C194.5,59,190.3,54.7,185,54.7z    M124.9,12c11.8,0,21.4,9.6,21.4,21.4c0,11.8-9.6,21.4-21.4,21.4h-21.4V33.4C103.5,21.6,113.1,12,124.9,12z M53.8,33.4   c0-11.8,9.6-21.4,21.4-21.4c11.8,0,21.4,9.6,21.4,21.4v21.4H75.1C63.3,54.7,53.8,45.2,53.8,33.4z M175.4,181.5   c0,3.6-2.9,6.5-6.5,6.5H31.1c-3.6,0-6.5-2.9-6.5-6.5V95.3h150.9V181.5z'
                    />
                </g>
            </svg>
            <div
                style={{
                    display        : 'flex',
                    alignItems     : 'center',
                    flexDirection  : 'row',
                    justifyContent : 'flex-start',
                }}
            >
                <div
                    style={{
                        fontSize   : 20,
                        fontWeight : '500',
                        fontFamily : 'Poppins',
                        position   : 'relative',
                    }}
                >
                    { __( 'Christmas Sales', 'storegrowth-sales-booster' ) }
                </div>
            </div>
            { coutdownEnable &&
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
                    color           : '#073B4C',
                    padding         : '1px 12px',
                    fontSize        : 12,
                    fontWeight      : 600,
                    borderRadius    : '5px',
                    backgroundColor : '#fff',
                } }
            >
                { __( 'Shop Now', 'storegrowth-sales-booster' ) }
            </span>
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
                        fill={ '#ffffff' }
                        d='M0.781396 16.0001C0.626858 16.0001 0.475783 15.9543 0.347281 15.8685C0.218778 15.7826 0.118621 15.6606 0.0594776 15.5178C0.000334661 15.3751 -0.0151369 15.218 0.0150198 15.0664C0.0451766 14.9148 0.119607 14.7756 0.228896 14.6664L14.6664 0.228853C14.8129 0.0823209 15.0117 0 15.2189 0C15.4261 0 15.6249 0.0823209 15.7714 0.228853C15.9179 0.375385 16.0002 0.574125 16.0002 0.781353C16.0002 0.988581 15.9179 1.18732 15.7714 1.33385L1.3339 15.7714C1.26141 15.844 1.17528 15.9016 1.08047 15.9408C0.985653 15.9801 0.884016 16.0002 0.781396 16.0001Z'
                    />
                    <path
                        fill={ '#ffffff' }
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
    );
}

export default NotifyBarOne;
