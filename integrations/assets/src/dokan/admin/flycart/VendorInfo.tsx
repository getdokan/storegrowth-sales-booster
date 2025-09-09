import {__} from "@wordpress/i18n";

const VendorInfo = ({storeData}) => {
    if (!storeData?.show_quick_cart_dokan_store_names) {
        return null
    }
    return (
        <div>
            <strong>{__('Vendor ', 'dokan')}:</strong>
            <span style={ storeData?.enable_quick_cart_dokan_store_links ? {textDecoration: 'underline'} : {} }>
                {__('Bright Star Market', 'dokan')}
            </span>
        </div>
    );
}

export default VendorInfo;
