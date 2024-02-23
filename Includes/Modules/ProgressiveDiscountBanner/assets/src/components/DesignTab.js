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
        isValid,
        formData,
        setFormData,
        onFieldChange,
        onFormSave,
        buttonLoading,
        fontFamily,
        onFormReset,
        undoHandler,
        showUndoIcon
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
                    colSpan={12}
                    name={'background_color'}
                    undoHandler={undoHandler}
                    changeHandler={onFieldChange}
                    fieldValue={formData.background_color}
                    showUndoIcon={showUndoIcon?.background_color}
                    title={__('Background Color', 'storegrowth-sales-booster')}
                />
                <ColourPicker
                    colSpan={12}
                    name={'text_color'}
                    undoHandler={undoHandler}
                    changeHandler={onFieldChange}
                    fieldValue={formData.text_color}
                    showUndoIcon={showUndoIcon?.text_color}
                    title={__('Text Color', 'storegrowth-sales-booster')}
                />
                <ColourPicker
                    colSpan={12}
                    name={'icon_color'}
                    undoHandler={undoHandler}
                    changeHandler={onFieldChange}
                    fieldValue={formData.icon_color}
                    showUndoIcon={showUndoIcon?.icon_color}
                    title={__('Icon Color', 'storegrowth-sales-booster')}
                />
                <ColourPicker
                    colSpan={12}
                    undoHandler={undoHandler}
                    name={'close_icon_color'}
                    changeHandler={onFieldChange}
                    fieldValue={formData.close_icon_color}
                    showUndoIcon={showUndoIcon?.close_icon_color}
                    title={__('Close Button Color', 'storegrowth-sales-booster')}
                />
                { Boolean( formData.btn_style ) && (
                    <Fragment>
                        <ColourPicker
                            colSpan={12}
                            name={'btn_color'}
                            undoHandler={undoHandler}
                            changeHandler={onFieldChange}
                            fieldValue={formData.btn_color}
                            showUndoIcon={showUndoIcon?.btn_color}
                            title={__('CTA Background', 'storegrowth-sales-booster')}
                        />
                        <ColourPicker
                            colSpan={12}
                            name={'btn_text_color'}
                            undoHandler={undoHandler}
                            changeHandler={onFieldChange}
                            fieldValue={formData.btn_text_color}
                            showUndoIcon={showUndoIcon?.btn_text_color}
                            title={__( 'CTA Text Color', 'storegrowth-sales-booster')}
                        />
                    </Fragment>
                ) }
            </SettingsSection>

            <Templates
                formData={ formData }
                setFormData={ setFormData }
                showUndoIcon={ showUndoIcon }
            />

            <ActionsHandler
                resetHandler={onFormReset}
                loadingHandler={buttonLoading}
                saveHandler={isValid && onFormSave}
            />
        </Fragment>
    );
}

export default DesignTab;
