import { Button } from 'antd';
import { __ } from '@wordpress/i18n';
import { useSelect } from '@wordpress/data';

const CreateBumpButton = ( { navigate } ) => {
    const { bumpListData } = useSelect( ( select ) => ( {
        bumpListData: select( 'sgsb_order_bump' ).getBumpData()
    } ) );

    const isDisableBumpCreation = bumpListData?.length >= 2 && !sgsbAdmin.isPro;

    return (
        <Button
            shape="round"
            disabled={ isDisableBumpCreation }
            className={ `create-upsell-order-bump-button` }
            onClick={ () => navigate( "/upsell-order-bump/create-bump" ) }
        >
            { __( 'Create New', 'storegrowth-sales-booster' ) }
        </Button>
    );
}

export default CreateBumpButton;
