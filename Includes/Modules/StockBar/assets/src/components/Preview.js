import React, {Fragment} from "react";
import { __ } from "@wordpress/i18n";
import {applyFilters} from "@wordpress/hooks";

const Preview = ( { formData } ) => {
    return (
        <div
            className='sgsb-stock-bar'
            style={ {
                height       : '100%',
                border       : `2px solid ${ formData?.stockbar_border_color }`,
                padding      : 16,
                overflow     : 'hidden',
                background   : '#fff',
                borderRadius : 6,
            } }
        >
            <div
                className='sgsb-stock-progress-bar-section wpbsc_total_sale'
                style={ {
                    gap     : 16,
                    display : 'grid',
                } }
            >
                { formData?.stock_display_format === 'above' ? (
                    <Fragment>
                        <div
                            className='sgsb-stock-progress-title'
                            style={ {
                                justifyContent : 'space-between',
                                lineHeight     : 1,
                                fontSize       : 14,
                                display        : 'flex',
                                color          : '#073B4C',
                            } }
                        >
                            <span className='sgsb-stock-progress-sold-title'>
                                { formData?.total_sell_count_text }:
                                <span
                                    style={ { fontWeight: 600 } }
                                    className='sgsb-stock-progress-count'
                                >
                                    { __( ' 247', 'storegrowth-sales-booster' ) }
                                </span>
                            </span>
                            <span className='sgsb-stock-progress-available-title'>
                                { formData?.available_item_count_text }:
                                <span
                                    style={ { fontWeight: 500 } }
                                    className='sgsb-stock-progress-count'
                                >
                                    { __( ' 123', 'storegrowth-sales-booster' ) }
                                </span>
                            </span>
                        </div>
                        <div
                            className='jqmeter-container'
                            style={ {
                                width           : '100%',
                                height          : `${ formData?.stockbar_height }px`,
                                display         : 'block',
                                overflow        : 'hidden',
                                borderRadius    : 5,
                                backgroundColor : formData?.stockbar_bg_color,
                            } }
                        >
                            <div
                                className={ `therm inner-therm` }
                                style={ {
                                    width        : '65%',
                                    height       : '100%',
                                    background   : formData?.stockbar_fg_color,
                                    borderRadius : 5,
                                } }
                            ></div>
                        </div>
                    </Fragment>
                ) : (
                    <Fragment>
                        <div
                            className='jqmeter-container'
                            style={ {
                                width           : '100%',
                                height          : `${ formData?.stockbar_height }px`,
                                display         : 'block',
                                overflow        : 'hidden',
                                borderRadius    : 5,
                                backgroundColor : formData?.stockbar_bg_color,
                            } }
                        >
                            <div
                                className={ `therm inner-therm` }
                                style={ {
                                    width        : '65%',
                                    height       : '100%',
                                    background   : formData?.stockbar_fg_color,
                                    borderRadius : 5,
                                } }
                            ></div>
                        </div>
                        <div
                            className='sgsb-stock-progress-title'
                            style={ {
                                justifyContent : 'space-between',
                                lineHeight     : 1,
                                fontSize       : 14,
                                display        : 'flex',
                                color          : '#073B4C',
                            } }
                        >
                            <span className='sgsb-stock-progress-sold-title'>
                                { formData?.total_sell_count_text }:
                                <span
                                    style={ { fontWeight: 600 } }
                                    className='sgsb-stock-progress-count'
                                >
                                    { __( ' 247', 'storegrowth-sales-booster' ) }
                                </span>
                            </span>
                            <span className='sgsb-stock-progress-available-title'>
                                { formData?.available_item_count_text }:
                                <span
                                    style={ { fontWeight: 500 } }
                                    className='sgsb-stock-progress-count'
                                >
                                    { __( ' 123', 'storegrowth-sales-booster' ) }
                                </span>
                            </span>
                        </div>
                    </Fragment>
                ) }

                { Boolean( formData.show_stock_status ) && applyFilters(
                    'sgsb_before_stock_bar_preview_end',
                    '',
                    formData,
                ) }
            </div>
        </div>
    );
};

export default Preview;
