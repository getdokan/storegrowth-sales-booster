import { __ } from '@wordpress/i18n';
import { useState, useEffect } from '@wordpress/element';
import { useSelect, useDispatch } from '@wordpress/data';
import { notification } from "antd";

const VendorsSettings = () => {
    // @ts-ignore
    const { SGSettings: { Switcher, SettingsSection, ActionsHandler } } = window;
    const [buttonLoading, setButtonLoading] = useState(false);
    const iniBogoVendorsSettings = {
        vendors_can_create_buy_x_get_x: true,
        vendors_can_schedule_offers: false,
        vendors_can_set_shop_page_custom_message: false,
        vendors_can_set_product_page_custom_message: false,
    };
    const { setExtensionData } = useDispatch("sgsb_bogo");
    // @ts-ignore
    const { bogoVendorsSettingsData: currentVendorsSettings = {} } = useSelect( ( select ) => ( {
        // @ts-ignore
        bogoVendorsSettingsData: select("sgsb_bogo").getExtensionData().dokanBogoVendorsSettings,
    } ) );
    const onFieldChange = ( key, value ) => {
        setExtensionData( {
            dokanBogoVendorsSettings: {
                ...currentVendorsSettings,
                [key]: value,
            },
        } );
    };

    const onFormSave = ( type ) => {
        setButtonLoading( true );

        jQuery.post(
            sgsbAdmin.ajax_url,
            {
                action: "sgsb_bogo_vendors_save_settings",
                data: JSON.stringify( {
                    sgsb_bogo_dokan_vendors_settings_data: currentVendorsSettings,
                } ),
                _ajax_nonce: sgsbAdmin.nonce,
            },
            function ( response ) {
                setExtensionData( {
                    dokanBogoVendorsSettings: response.data,
                } );

                setButtonLoading( false );
                notificationMessage( type );
            } );
    };

    const onFormReset = () => {
        setExtensionData( {
            dokanBogoVendorsSettings: iniBogoVendorsSettings,
        } );
    };

    const notificationMessage = ( type ) => {
        if ( "vendors_settings" === type ) {
            notification["success"]( {
                message:  __( 'Vendors Settings Section', 'storegrowth-sales-booster-pro' ),
                description:  __( 'Vendors section settings data updated successfully.', 'storegrowth-sales-booster-pro' ),
            } );
        }
    };

    useEffect( () => {
        let $ = jQuery;
        $.post(
            sgsbAdmin.ajax_url,
            {
                action: "sgsb_bogo_vendors_get_settings",
                data: [],
                _ajax_nonce: sgsbAdmin.nonce,
            },
            function ( response ) {
                setExtensionData( {
                    dokanBogoVendorsSettings: response.data,
                } );
            }
        );
    }, [] );

    return (
        <SettingsSection>
            <div style={{ marginBottom: 24 }}>
                <Switcher
                    name="vendors_can_create_buy_x_get_x"
                    title={ __( 'Vendors Can Create Buy X Get X', 'storegrowth-sales-booster-pro' ) }
                    tooltip={ __( 'Allow vendors to create buy X get X', 'storegrowth-sales-booster-pro' ) }
                    isEnable={ currentVendorsSettings?.vendors_can_create_buy_x_get_x }
                    changeHandler={ onFieldChange }
                />
                <Switcher
                    name="vendors_can_schedule_offers"
                    title={ __( 'Vendors Can Schedule Offers', 'storegrowth-sales-booster-pro' ) }
                    tooltip={ __( 'Allow vendors to schedule offers', 'storegrowth-sales-booster-pro' ) }
                    isEnable={ currentVendorsSettings?.vendors_can_schedule_offers }
                    changeHandler={ onFieldChange }
                />
                <Switcher
                    name="vendors_can_set_shop_page_custom_message"
                    title={ __( 'Vendors Can Set Shop Page Custom Messages', 'storegrowth-sales-booster-pro' ) }
                    tooltip={ __( 'Allow vendors to set shop page custom messages', 'storegrowth-sales-booster-pro' ) }
                    isEnable={ currentVendorsSettings?.vendors_can_set_shop_page_custom_message }
                    changeHandler={ onFieldChange }
                />
                <Switcher
                    name="vendors_can_set_product_page_custom_message"
                    title={ __( 'Vendors Can Set Shop Page Custom Messages', 'storegrowth-sales-booster-pro' ) }
                    tooltip={ __( 'Allow vendors to set shop page custom messages', 'storegrowth-sales-booster-pro' ) }
                    isEnable={ currentVendorsSettings?.vendors_can_set_product_page_custom_message }
                    changeHandler={ onFieldChange }
                />
            </div>
            <ActionsHandler
                resetHandler={ onFormReset }
                loadingHandler={ buttonLoading }
                saveHandler={ () => onFormSave( 'vendors_settings' ) }
            />
        </SettingsSection>
    );
}

export default VendorsSettings;
