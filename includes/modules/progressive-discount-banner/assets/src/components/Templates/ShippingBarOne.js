import React from "react";
import {__} from "@wordpress/i18n";

const ShippingBarOne = ({ formData }) => {
    const cart_min_amount = sgsbAdmin.currencySymbol + formData.cart_minimum_amount;
    const dynamicText = formData?.progressive_banner_text?.replace(
        '[amount]',
        cart_min_amount
    );

    const getLabelByValue = ( value, object ) => {
        const font = object.find( ( font ) => font.value === value );
        return font ? font.label : '';
    };

    const fontFamily = [
        {
            value: "poppins",
            label: __("Poppins", "storegrowth-sales-booster"),
        },
        {
            value: "roboto",
            label: __("Roboto", "storegrowth-sales-booster"),
        },
        {
            value: "lato",
            label: __("Lato", "storegrowth-sales-booster"),
        },
        {
            value: "montserrat",
            label: __("Montserrat", "storegrowth-sales-booster"),
        },
        {
            value: "ibm_plex_sans",
            label: __("IBM Plex Sans", "storegrowth-sales-booster"),
        },
    ];

    const selectedFont = getLabelByValue( formData.font_family, fontFamily );

    return (
        <div
            style={{
                gap             : '63px',
                color           : formData.text_color,
                width           : '100%',
                height          : formData.banner_height,
                display         : 'flex',
                padding         : '20px',
                fontSize        : '16px',
                position        : 'absolute',
                textAlign       : 'center',
                fontFamily      : 'Inter',
                alignItems      : 'center',
                borderRadius    : '5px',
                flexDirection   : 'row',
                justifyContent  : 'space-between',
                backgroundColor : formData.background_color,
            }}
        >
            { formData?.progressive_banner_icon_html ? (
                <div
                    dangerouslySetInnerHTML={{
                        __html: formData.progressive_banner_icon_html,
                    }}
                />
            ) : (
                <svg
                    fill='none'
                    viewBox='0 0 32 32'
                    style={{
                        width      : '32px',
                        height     : '32px',
                        position   : 'relative',
                        overflow   : 'hidden',
                        flexShrink : '0',
                    }}
                >
                    <g clipPath='url(#clip0_986_734)'>
                        <path
                            fill={ formData?.icon_color }
                            d='M29.8722 16.4146C29.7435 16.1511 29.7435 15.849 29.8722 15.5857L31.0657 13.1441C31.7302 11.7847 31.2037 10.1644 29.8671 9.45519L27.4665 8.18144C27.2075 8.04407 27.0299 7.79957 26.9792 7.51089L26.5097 4.83409C26.2483 3.34372 24.8697 2.34223 23.3718 2.55416L20.681 2.93479C20.3905 2.97579 20.1033 2.88241 19.8927 2.6786L17.9395 0.789113C16.8519 -0.263006 15.1482 -0.263069 14.0607 0.789113L12.1075 2.67879C11.8967 2.88266 11.6095 2.97585 11.3191 2.93498L8.62835 2.55435C7.12992 2.34229 5.75181 3.34391 5.49037 4.83428L5.02087 7.51095C4.97019 7.7997 4.79262 8.04413 4.53369 8.18157L2.13308 9.45531C0.796461 10.1644 0.269964 11.7849 0.93446 13.1443L2.12789 15.5858C2.25664 15.8492 2.25664 16.1513 2.12789 16.4147L0.934397 18.8562C0.269901 20.2156 0.796398 21.8359 2.13302 22.5451L4.53363 23.8189C4.79262 23.9562 4.97019 24.2007 5.02087 24.4894L5.49037 27.1662C5.72837 28.5229 6.89174 29.4744 8.22879 29.4743C8.36048 29.4743 8.4941 29.4651 8.62841 29.4461L11.3192 29.0654C11.6094 29.0243 11.8968 29.1178 12.1075 29.3216L14.0607 31.2111C14.6046 31.7372 15.3022 32.0002 16.0001 32.0002C16.6977 32.0001 17.3958 31.7371 17.9394 31.2111L19.8927 29.3216C20.1034 29.1178 20.3907 29.0247 20.681 29.0654L23.3718 29.4461C24.8704 29.6581 26.2483 28.6565 26.5097 27.1661L26.9793 24.4895C27.03 24.2007 27.2076 23.9563 27.4665 23.8189L29.8671 22.5451C31.2037 21.836 31.7302 20.2156 31.0657 18.8561L29.8722 16.4146ZM12.3088 7.69482C14.1745 7.69482 15.6924 9.21275 15.6924 11.0785C15.6924 12.9442 14.1745 14.4622 12.3088 14.4622C10.443 14.4622 8.9251 12.9442 8.9251 11.0785C8.9251 9.21275 10.443 7.69482 12.3088 7.69482ZM10.5623 22.7429C10.3821 22.923 10.1459 23.0132 9.90978 23.0132C9.67366 23.0132 9.43741 22.9231 9.25729 22.7429C8.89691 22.3825 8.89691 21.7982 9.25729 21.4378L21.4378 9.25731C21.7981 8.89694 22.3825 8.89694 22.7428 9.25731C23.1032 9.61769 23.1032 10.202 22.7428 10.5624L10.5623 22.7429ZM19.6912 24.3055C17.8255 24.3055 16.3076 22.7875 16.3076 20.9218C16.3076 19.0561 17.8255 17.5381 19.6912 17.5381C21.557 17.5381 23.0749 19.0561 23.0749 20.9218C23.0749 22.7875 21.557 24.3055 19.6912 24.3055Z'
                        />
                        <path
                            fill={ formData?.icon_color }
                            d='M19.6914 19.3828C18.8433 19.3828 18.1533 20.0727 18.1533 20.9208C18.1533 21.7689 18.8433 22.4588 19.6914 22.4588C20.5394 22.4588 21.2294 21.7689 21.2294 20.9208C21.2294 20.0727 20.5394 19.3828 19.6914 19.3828Z'
                        />
                        <path
                            fill={ formData?.icon_color }
                            d='M12.3085 9.54102C11.4604 9.54102 10.7705 10.2309 10.7705 11.079C10.7705 11.9271 11.4604 12.6171 12.3085 12.6171C13.1566 12.6171 13.8466 11.9271 13.8466 11.079C13.8465 10.231 13.1566 9.54102 12.3085 9.54102Z'
                        />
                    </g>
                    <defs>
                        <clipPath id='clip0_986_734'>
                            <rect width='32' height='32' fill='white' />
                        </clipPath>
                    </defs>
                </svg>
            ) }
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
                        fontWeight : '500',
                        position   : 'relative',
                        fontFamily : selectedFont,
                        fontSize   : formData.font_size,
                    }}
                >
                    { dynamicText }
                </div>
            </div>
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
                        fill={ formData?.close_icon_color }
                        d='M0.781396 16.0001C0.626858 16.0001 0.475783 15.9543 0.347281 15.8685C0.218778 15.7826 0.118621 15.6606 0.0594776 15.5178C0.000334661 15.3751 -0.0151369 15.218 0.0150198 15.0664C0.0451766 14.9148 0.119607 14.7756 0.228896 14.6664L14.6664 0.228853C14.8129 0.0823209 15.0117 0 15.2189 0C15.4261 0 15.6249 0.0823209 15.7714 0.228853C15.9179 0.375385 16.0002 0.574125 16.0002 0.781353C16.0002 0.988581 15.9179 1.18732 15.7714 1.33385L1.3339 15.7714C1.26141 15.844 1.17528 15.9016 1.08047 15.9408C0.985653 15.9801 0.884016 16.0002 0.781396 16.0001Z'
                    />
                    <path
                        fill={ formData?.close_icon_color }
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

export default ShippingBarOne;
