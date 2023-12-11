import { __ } from '@wordpress/i18n';
import { UpgradeCrown, UpgradeOverlay } from '../../../settings/Panels';

const CouponPreview = () => {
    return (
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
                <UpgradeCrown proBadge={ false } />
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
                        background: '#0875FF',
                    } }
                >
                    { __( 'Apply Now', 'storegrowth-sales-booster' ) }
                </div>
            </div>
            <UpgradeOverlay />
        </div>
    );
}

export default CouponPreview;
