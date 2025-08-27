import { Fragment } from "react";
import { __ } from "@wordpress/i18n";
import StockBarOne from "./StockBarOne";
import { applyFilters } from "@wordpress/hooks";
import SectionHeader from "sales-booster/src/components/settings/Panels/SectionHeader";
import SettingsSection from "sales-booster/src/components/settings/Panels/PanelSettings/SettingsSection";
import RadioTemplate from "sales-booster/src/components/settings/Panels/PanelSettings/Fields/RadioTemplate";
import StockBarTwo from "./StockBarTwo";
import StockBarThree from "./StockBarThree";

const Templates = ( {
    formData,
    setFormData,
} ) => {

    let templates = [
        { key: 'stock_bar_one', component: <StockBarOne activeTemplate={ formData?.stockbar_template === 'stock_bar_one' } /> },
        { key: 'stock_bar_two', component: <StockBarTwo activeTemplate={ formData?.stockbar_template === 'stock_bar_two' } /> },
        { key: 'stock_bar_three', component: <StockBarThree activeTemplate={ formData?.stockbar_template === 'stock_bar_three' } /> },
    ];

    const templateStyles = {
        stock_bar_one: {
            stockbar_height           : 10,
            stockbar_bg_color         : "#EBF6FF",
            stockbar_fg_color         : "#008DFF",
            stockbar_template         : 'stock_bar_one',
            show_stock_status         : true,
            stock_status_text         : __( 'Hurry! only {quantity} stocks left.', 'storegrowth-sales-booster' ),
            status_text_color         : '#073B4C',
            stock_display_format      : 'above',
            stockbar_border_color     : '#DDE6F9',
            total_sell_count_text     : __( 'Total Sold', 'storegrowth-sales-booster' ),
            status_quantity_required  : 10,
            available_item_count_text : __( 'Available Item', 'storegrowth-sales-booster' ),
        },
        stock_bar_two: {
            stockbar_height           : 10,
            stockbar_bg_color         : "#E6F8F1",
            stockbar_fg_color         : "#02AC6E",
            stockbar_template         : 'stock_bar_two',
            show_stock_status         : true,
            stock_status_text         : __( 'Hurry! only {quantity} stocks left.', 'storegrowth-sales-booster' ),
            status_text_color         : '#073B4C',
            stock_display_format      : 'above',
            stockbar_border_color     : '#BDE5D7',
            total_sell_count_text     : __( 'Total Sold', 'storegrowth-sales-booster' ),
            status_quantity_required  : 10,
            available_item_count_text : __( 'Available Item', 'storegrowth-sales-booster' ),
        },
        stock_bar_three: {
            stockbar_height           : 10,
            stockbar_bg_color         : "#EFF0F8",
            stockbar_fg_color         : "linear-gradient(90deg, #AF89FF 0%, #0283AC 100%)",
            stockbar_template         : 'stock_bar_three',
            show_stock_status         : true,
            stock_status_text         : __( 'Hurry! only {quantity} stocks left.', 'storegrowth-sales-booster' ),
            status_text_color         : '#073B4C',
            stock_display_format      : 'above',
            stockbar_border_color     : '#ae89ff33',
            total_sell_count_text     : __( 'Total Sold', 'storegrowth-sales-booster' ),
            status_quantity_required  : 10,
            available_item_count_text : __( 'Available Item', 'storegrowth-sales-booster' ),
        },
    };

    // List of shipping bar templates.
    templates = applyFilters(
        "sgsb_shipping_bar_templates",
        templates,
    );

    const onTemplateChange = ( name, value ) => {
        setFormData( {
            ...formData,
            ...templateStyles?.[ value ]
        } );
    };

    return (
        <Fragment>
            <SectionHeader title={ __( 'Template', 'storegrowth-sales-booster' ) } />
            <SettingsSection>
                <RadioTemplate
                    options={ templates }
                    name={ `stockbar_template` }
                    classes={ `stock-bar-templates` }
                    changeHandler={ onTemplateChange }
                    fieldValue={ formData?.stockbar_template }
                />
            </SettingsSection>
        </Fragment>
    );
};

export default Templates;
