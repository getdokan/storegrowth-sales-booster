import { __ } from "@wordpress/i18n";
import {applyFilters} from "@wordpress/hooks";

const StockBarTwo = ( { activeTemplate } ) => {
    return (
        <div
            className='sgsb-stock-bar'
            style={ {
                height       : '100%',
                border       : `2px solid #${ activeTemplate ? '008DFF' : 'BDE5D7' }`,
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
                        { __( 'Total Sold: ', 'storegrowth-sales-booster' ) }
                        <span
                            style={ { fontWeight: 600 } }
                            className='sgsb-stock-progress-count'
                        >
                            { __( '247', 'storegrowth-sales-booster' ) }
                        </span>
                    </span>
                    <span className='sgsb-stock-progress-available-title'>
                        { __( 'Available Item: ', 'storegrowth-sales-booster' ) }
                        <span
                            style={ { fontWeight: 500 } }
                            className='sgsb-stock-progress-count'
                        >
                            { __( '123', 'storegrowth-sales-booster' ) }
                        </span>
                    </span>
                </div>
                <div
                    className='jqmeter-container'
                    style={ {
                        width           : '100%',
                        height          : 10,
                        display         : 'block',
                        overflow        : 'hidden',
                        borderRadius    : 5,
                        backgroundColor : '#E6F8F1',
                    } }
                >
                    <div
                        className={ `therm inner-therm` }
                        style={ {
                            width           : '65%',
                            height          : '100%',
                            borderRadius    : 5,
                            backgroundColor : '#02AC6E',
                        } }
                    ></div>
                </div>

                { applyFilters( 'sgsb_before_stock_bar_preview_template_end', '' ) }
            </div>
        </div>
    );
}

export default StockBarTwo;
