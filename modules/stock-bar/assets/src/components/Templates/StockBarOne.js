import { __ } from '@wordpress/i18n';
import {applyFilters} from "@wordpress/hooks";

const StockBarOne = ( { activeTemplate } ) => {
    return (
        <div
            className='spsg-stock-bar'
            style={ {
                height       : '100%',
                border       : `2px solid #${ activeTemplate ? '008DFF' : 'DDE6F9' }`,
                padding      : 16,
                overflow     : 'hidden',
                background   : '#fff',
                borderRadius : 6,
            } }
        >
            <div
                className='spsg-stock-progress-bar-section wpbsc_total_sale'
                style={ {
                    gap     : 16,
                    display : 'grid',
                } }
            >
                <div
                    className='spsg-stock-progress-title'
                    style={ {
                        justifyContent : 'space-between',
                        lineHeight     : 1,
                        fontSize       : 14,
                        display        : 'flex',
                        color          : '#073B4C',
                    } }
                >
                    <span className='spsg-stock-progress-sold-title'>
                        { __( 'Total Sold: ', 'storegrowth-sales-booster' ) }
                        <span
                            style={ { fontWeight: 600 } }
                            className='spsg-stock-progress-count'
                        >
                            { __( '247', 'storegrowth-sales-booster' ) }
                        </span>
                    </span>
                    <span className='spsg-stock-progress-available-title'>
                        { __( 'Available Item: ', 'storegrowth-sales-booster' ) }
                        <span
                            style={ { fontWeight: 500 } }
                            className='spsg-stock-progress-count'
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
                        backgroundColor : '#EBF6FF',
                    } }
                >
                    <div
                        className={ `therm inner-therm` }
                        style={ {
                            width           : '65%',
                            height          : '100%',
                            borderRadius    : 5,
                            backgroundColor : '#008DFF',
                        } }
                    ></div>
                </div>

                { applyFilters( 'spsg_before_stock_bar_preview_template_end', '' ) }
            </div>
        </div>
    );
}

export default StockBarOne;
