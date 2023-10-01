import { Typography, Input, Col } from "antd";
import SettingsTooltip from "../SettingsTooltip";
import UpgradeCrown from "../UpgradeCrown";
import FieldWrapper from "./FieldWrapper";

const { Title } = Typography;

const TextInput = ( {
    name,
    title,
    tooltip,
    fieldValue,
    changeHandler,
    placeHolderText,
    colSpan = 24,
    needUpgrade = false
} ) => {

    return (
        // Make settings textarea component with card preview.
        <FieldWrapper colSpan={ colSpan } upgradeClass={ needUpgrade ? `upgrade-settings` : '' }>
            <Col span={14}>
                <div className={ `card-heading textinput-heading` }>
                    {/* Handle switcher title. */}
                    <Title level={ 3 } className={ `settings-heading space-top` }>{ title }</Title>
                    {/* Handle switcher tooltip. */}
                    { tooltip && <SettingsTooltip content={ tooltip } /> }
                    {/* Handle switcher upgrade icon. */}
                    { needUpgrade && <UpgradeCrown /> }
                </div>
            </Col>

            <Col span={10}>
                {/* Handle settings textarea field by using dynamic props */}
                <Input
                    disabled={ needUpgrade }
                    placeholder={ placeHolderText }
                    value={ fieldValue ? fieldValue : '' }
                    className={ `settings-field textinput-field` }
                    onChange={ ( event ) => changeHandler( name, event.target.value ) }
                />
            </Col>
        </FieldWrapper>
    );
}

export default TextInput;
