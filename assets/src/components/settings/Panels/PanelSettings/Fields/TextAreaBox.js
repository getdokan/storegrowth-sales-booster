import { Typography, Input, Col } from "antd";
import SettingsTooltip from "../SettingsTooltip";
import { applyFilters } from "@wordpress/hooks";
import UpgradeCrown from "../UpgradeCrown";
import FieldWrapper from "./FieldWrapper";

const { TextArea } = Input;
const { Title } = Typography;

const TextAreaBox = ( {
    name,
    title,
    tooltip,
    areaRows,
    fieldValue,
    changeHandler,
    placeHolderText,
    colSpan = 24,
    needUpgrade = false
} ) => {
    // Render textarea content after settings field, if needed.
    const renderAreaContent = applyFilters(
        "sgsb_after_textarea_settings",
        '',
    );

    return (
        // Make settings textarea component with card preview.
        <FieldWrapper colSpan={ colSpan }>
            <Col span={9}>
                <div className={ `card-heading textarea-heading` }>
                    {/* Handle switcher title. */}
                    <Title level={ 3 } className={ `settings-heading` }>{ title }</Title>
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
                    disabled={ needUpgrade }
                    placeholder={ placeHolderText }
                    value={ fieldValue ? fieldValue : '' }
                    className={ `${ renderAreaContent !== '' ? 'field-gap' : '' } settings-field textarea-field` }
                    onChange={ ( event ) => changeHandler( name, event.target.value ) }
                />
                { renderAreaContent }
            </Col>
        </FieldWrapper>
    );
}

export default TextAreaBox;
