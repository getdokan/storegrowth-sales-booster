import {__} from "@wordpress/i18n";

const VendorInfo = ({storeData}) => {
    if (!storeData?.show_quick_cart_dokan_store_names) {
        return null
    }
    return (
        <div>
            <strong>{__('Vendor ', 'dokan')}:</strong>
            {__('Bright Star Market', 'dokan')}
        </div>
    );
}

export default VendorInfo;
