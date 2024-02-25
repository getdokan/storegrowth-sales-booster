import { __ } from '@wordpress/i18n';
import {Fragment} from 'react';
import { addFilter } from '@wordpress/hooks';
import SingleCheckBox from '../../../settings/Panels/PanelSettings/Fields/SingleCheckBox';
import GeneratedCode from './GeneratedCode';
import Countdown from './Countdown';
import ColourPicker from "../../../settings/Panels/PanelSettings/Fields/ColorPicker";
import { Switcher } from '../../../settings/Panels';

// Handle stock bar modules pro settings prompts.
addFilter(
    'sgsb_shop_sales_countdown_enable_settings',
    'sgsb_shop_sales_countdown_enable_settings_callback',
    (component) => {
        return (
            <SingleCheckBox
                needUpgrade={true}
                name={'shop_page_countdown_enable'}
                checkedValue={false}
                className={`settings-field checkbox-field`}
                title={__('Shop Page Display', 'storegrowth-sales-booster')}
                tooltip={__(
                    'The sales countdown will show on the shop page',
                    'storegrowth-sales-booster'
                )}
            />
        );
    }
);

addFilter(
    'sgsb_countdown_timer_block_enable_settings',
    'sgsb_countdown_timer_block_enable_settings_callback',
    (component) => {
        return (
            <Switcher
            colSpan={ 24 }
            isEnable={ false }
            needUpgrade={ true }
            name={ 'enable_ct_block' }
            title={ __( 'Enable Timer Block', 'storegrowth-sales-booster' ) }
            tooltip={ __(
                'By enableing the block will be able to use the countdown timer block',
                'storegrowth-sales-booster'
            ) }
        />
        );
    }
);

addFilter(
    "sgsb_ct_short_code_generator_settings",
    "sgsb_ct_short_code_generator_settings_callback",
    (component, formData, onFieldChange) => {

        const {
            SGSettings: { TextInput },
        } = window;

        return (
            <Fragment>
                <GeneratedCode formData={formData} />
                <TextInput
                    needUpgrade={true}
                    name={"countdown_heading"}
                    placeHolderText={__(
                        "Last chance! [discount]% OFF",
                        "storegrowth-sales-booster"
                    )}
                    fieldValue={__('Discount Off','storegrowth-sales-booster')}
                    className={`settings-field input-field`}
                    title={__("Countdown Heading", "storegrowth-sales-booster")}
                    tooltip={__(
                        "Will show the heading text",
                        "storegrowth-sales-booster"
                    )}
                />
                <Countdown formData={formData} onFieldChange={onFieldChange} />
            </Fragment>
        );
    }
);

addFilter(
    'sgsb_append_countdown_design_settings',
    'sgsb_append_countdown_design_settings_callback',
    () =>  {
        return (
            <Fragment>
                <ColourPicker
                    needUpgrade={ true }
                    fieldValue={ `#FFFFFF` }
                    title={ __( "Counter Background Color", "storegrowth-sales-booster" ) }
                />

                <ColourPicker
                    needUpgrade={ true }
                    fieldValue={ `#ECEDF0` }
                    title={__("Counter Border Color", "storegrowth-sales-booster")}
                />

                <ColourPicker
                    needUpgrade={ true }
                    fieldValue={ `#1B1B50` }
                    title={__("Day Counter Text Color", "storegrowth-sales-booster")}
                />

                <ColourPicker
                    needUpgrade={ true }
                    fieldValue={ `#1B1B50` }
                    title={ __( "Hour Counter Text Color", "storegrowth-sales-booster" ) }
                />

                <ColourPicker
                    needUpgrade={ true }
                    fieldValue={ `#1B1B50` }
                    title={__("Minute Counter Text Color", "storegrowth-sales-booster")}
                />

                <ColourPicker
                    needUpgrade={ true }
                    fieldValue={ `#1B1B50` }
                    title={__("Second Counter Text Color", "storegrowth-sales-booster")}
                />
            </Fragment>
        );
    }
);

