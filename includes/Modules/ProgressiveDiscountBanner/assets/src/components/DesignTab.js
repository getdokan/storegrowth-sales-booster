import { Fragment } from 'react';
import { __ } from '@wordpress/i18n';
import { Button } from 'antd';

import SettingsSection from '../../../../../../assets/src/components/settings/Panels/PanelSettings/SettingsSection';
import ColourPicker from '../../../../../../assets/src/components/settings/Panels/PanelSettings/Fields/ColorPicker';
import Number from '../../../../../../assets/src/components/settings/Panels/PanelSettings/Fields/Number';
import SelectBox from '../../../../../../assets/src/components/settings/Panels/PanelSettings/Fields/SelectBox';
import ActionsHandler from 'sales-booster/src/components/settings/Panels/PanelSettings/ActionsHandler';

import Templates from './Templates';
import SectionHeader from 'sales-booster/src/components/settings/Panels/SectionHeader';
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
                <Number
                    min={1}
                    max={100}
                    style={{
                        width: '100px',
                    }}
                    name={`banner_height`}
                    changeHandler={onFieldChange}
                    fieldValue={formData.banner_height}
                    needUpgrade={upgradeTeaser}
                    title={__(`Banner Height`, 'storegrowth-sales-booster')}
                />
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
                <Number
                    min={1}
                    max={100}
                    style={{
                        width: '100px',
                    }}
                    name={`font_size`}
                    changeHandler={onFieldChange}
                    fieldValue={formData.font_size}
                    needUpgrade={upgradeTeaser}
                    title={__(`Font Size`, 'storegrowth-sales-booster')}
                />
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