import { Typography, Input } from "antd";
import SettingsTooltip from "../SettingsTooltip";
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
    return (
        // Make settings switcher component with card preview.
        <FieldWrapper colSpan={ colSpan }>
            <div className={ `card-heading full-height` }>
                {/* Handle switcher title. */}
                <Title level={ 3 } className={ `settings-heading` }>{ title }</Title>
                {/* Handle switcher tooltip. */}
                { tooltip && <SettingsTooltip content={ tooltip } /> }
                {/* Handle switcher upgrade icon. */}
                { needUpgrade && <UpgradeCrown /> }
            </div>

            {/* Handle settings textarea field by using dynamic props */}
            <TextArea
                rows={ areaRows }
                disabled={ needUpgrade }
                placeholder={ placeHolderText }
                value={ fieldValue ? fieldValue : '' }
                className={ `settings-field textarea-field` }
                onChange={ ( event ) => changeHandler( name, event.target.value ) }
            />
        </FieldWrapper>
    );
}

export default TextAreaBox;
