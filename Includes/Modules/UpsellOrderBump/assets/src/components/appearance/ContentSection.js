import { Input } from 'antd';
import { Fragment } from "react";
import { __ } from "@wordpress/i18n";
import { useDispatch, useSelect } from '@wordpress/data';

const ContentSection = () => {
    const { setCreateFromData } = useDispatch( 'sgsb_order_bump' );

    const { createBumpData } = useSelect( ( select ) => ( {
        createBumpData: select( 'sgsb_order_bump' ).getCreateFromData()
    } ) );

    const onFieldChange = ( key, value ) => {
        setCreateFromData( {
            ...createBumpData,
            [ key ]: value
        } );
    };

    return (
        <Fragment>
            { createBumpData?.offer_type === 'price' ? (
                <Fragment>
                    {/* Render fixed bump offer box settings. */}
                    <label
                        htmlFor={ `fixed-bump` }
                        className={ `content-bump-label` }
                    >
                        { __( 'For Fixed Price', 'storegrowth-sales-booster' ) }
                    </label>
                    <Input
                        id={ `fixed-bump` }
                        value={ createBumpData.offer_fixed_price_title }
                        onChange={ ( v ) => onFieldChange( 'offer_fixed_price_title', v.target.value ) }
                        placeholder={ __( 'Add fixed price title please', 'storegrowth-sales-booster' ) }
                    />
                </Fragment>
            ) : (
                <Fragment>
                    {/* Render discount bump offer box settings. */}
                    <label className={ `content-bump-label` } htmlFor={ `discount-bump` }>
                        { __( 'For Discount %', 'storegrowth-sales-booster' ) }
                    </label>
                    <Input
                        id={ `discount-bump` }
                        value={ createBumpData.offer_discount_title }
                        onChange={ ( v ) => onFieldChange( 'offer_discount_title', v.target.value ) }
                        placeholder={ __( 'Add discount title please', 'storegrowth-sales-booster' ) }
                    />
                </Fragment>
            ) }
        </Fragment>
    );
}

export default ContentSection;
