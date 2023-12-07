import { Fragment } from 'react';
import { __ } from '@wordpress/i18n';
import { applyFilters } from '@wordpress/hooks';
import SettingsSection from '../../../../../../assets/src/components/settings/Panels/PanelSettings/SettingsSection';
import ColourPicker from '../../../../../../assets/src/components/settings/Panels/PanelSettings/Fields/ColorPicker';
import Number from '../../../../../../assets/src/components/settings/Panels/PanelSettings/Fields/Number';
import SelectBox from '../../../../../../assets/src/components/settings/Panels/PanelSettings/Fields/SelectBox';
import ActionsHandler from 'sales-booster/src/components/settings/Panels/PanelSettings/ActionsHandler';

import Templates from './Templates';

function DesignTab(props) {
    const {
        formData,
        setFormData,
        onFieldChange,
        onFormSave,
        buttonLoading,
        upgradeTeaser,
        fontFamily,
        onFormReset,
    } = props;

    return (
        <Fragment>
            <SettingsSection>
            { applyFilters(
                    'sgsb_free_shipping_bar_height_settings',
                    '',
                    formData,
                    onFieldChange
                ) }
                <SelectBox
                    name={`font_family`}
                    options={[...fontFamily]}
                    fieldValue={formData.font_family}
                    changeHandler={onFieldChange}
                    title={__('Font Family', 'storegrowth-sales-booster')}
                    tooltip={__(
                        'Select your desired font family',
                        'storegrowth-sales-booster'
                    )}
                />
                { applyFilters(
                    'sgsb_free_shipping_bar_font_size',
                    '',
                    formData,
                    onFieldChange
                ) }
                
                <ColourPicker
                    name={'background_color'}
                    colSpan={12}
                    fieldValue={formData.background_color}
                    changeHandler={onFieldChange}
                    title={__('Background Color', 'storegrowth-sales-booster')}
                />
                <ColourPicker
                    name={'text_color'}
                    colSpan={12}
                    fieldValue={formData.text_color}
                    changeHandler={onFieldChange}
                    title={__('Text Color', 'storegrowth-sales-booster')}
                />
                <ColourPicker
                    name={'icon_color'}
                    colSpan={12}
                    fieldValue={formData.icon_color}
                    changeHandler={onFieldChange}
                    title={__('Icon Color', 'storegrowth-sales-booster')}
                />
                <ColourPicker
                    name={'close_icon_color'}
                    colSpan={12}
                    changeHandler={onFieldChange}
                    fieldValue={formData.close_icon_color}
                    title={__('Close Button Color', 'storegrowth-sales-booster')}
                />
            </SettingsSection>

            <Templates formData={ formData } setFormData={ setFormData } />

            <ActionsHandler
                resetHandler={onFormReset}
                loadingHandler={buttonLoading}
                saveHandler={onFormSave}
            />
        </Fragment>
    );
}

export default DesignTab;
