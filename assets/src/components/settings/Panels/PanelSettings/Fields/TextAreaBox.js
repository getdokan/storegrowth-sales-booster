import { Typography, Input, Col } from "antd";
import SettingsTooltip from "../SettingsTooltip";
import { applyFilters } from "@wordpress/hooks";
import UpgradeCrown from "../UpgradeCrown";
import FieldWrapper from "./FieldWrapper";
import UpgradeOverlay from "../UpgradeOverlay";

const { TextArea } = Input;
const { Title } = Typography;

const TextAreaBox = ( {
    name,
    title,
    tooltip,
    areaRows,
    readOnly,
    fieldValue,
    changeHandler,
    placeHolderText,
    colSpan = 24,
    needUpgrade = false,
    upgradeOverlay =true,
    inputRestrictor =false,
    renderTextAreaContent =false
} ) => {
    // Render textarea content after settings field, if needed.
    const renderAreaContent = applyFilters(
        "sgsb_after_textarea_settings",
        '',
    );

    return (
        // Make settings textarea component with card preview.
        <FieldWrapper colSpan={ colSpan } upgradeClass={ (needUpgrade&&upgradeOverlay) ? `upgrade-settings` : '' }>
            <Col span={9}>
                <div className={ `card-heading textarea-heading` }>
                    {/* Handle switcher title. */}
                    <Title level={ 3 } className={ `settings-heading space-top` }>{ title }</Title>
                    {/* Handle switcher tooltip. */}
                    { tooltip && <SettingsTooltip content={ tooltip } /> }
                    {/* Handle switcher upgrade icon. */}
                    { needUpgrade && <UpgradeCrown /> }
                </div>
            </Col>

            <Col span={15}>
                {/* Handle settings textarea field by using dynamic props */}
                <TextArea
                    rows={ areaRows }
                    disabled={ needUpgrade && upgradeOverlay }
                    placeholder={ placeHolderText }
                    value={ fieldValue ? fieldValue : '' }
                    className={ `${ renderTextAreaContent !== '' ? 'field-gap' : '' } settings-field textarea-field` }
                    onChange={ ( event ) => {inputRestrictor?
                    (event.nativeEvent.inputType==="deleteContentBackward"?changeHandler( name, event.target.value ):""):
                    changeHandler( name, event.target.value )} }
                    readOnly={ readOnly }
                />
                { renderTextAreaContent && renderAreaContent }
            </Col>
            <UpgradeOverlay /> 
        </FieldWrapper>
    );
}

export default TextAreaBox;
