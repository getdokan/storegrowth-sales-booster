import FieldWrapper from "./FieldWrapper";
import { Col, InputNumber, Typography} from "antd";
import SettingsTooltip from "../SettingsTooltip";
import UpgradeCrown from "../UpgradeCrown";

const { Title } = Typography;

const Number = ( {
    name,
    title,
    tooltip,
    fieldValue,
    changeHandler,
    placeHolderText,
    min = 1,
    max = 100,
    colSpan = 24,
    needUpgrade = false
} ) => {
    return (
        // Make settings number component with card preview.
        <FieldWrapper colSpan={ colSpan } align={ 'center' }>
            <Col span={15}>
                <div className={ `card-heading` }>
                    {/* Handle switcher title. */}
                    <Title level={ 3 } className={ `settings-heading` }>{ title }</Title>
                    {/* Handle switcher tooltip. */}
                    { tooltip && <SettingsTooltip content={ tooltip } /> }
                    {/* Handle switcher upgrade icon. */}
                    { needUpgrade && <UpgradeCrown /> }
                </div>
            </Col>

            <Col span={9}>
                {/* Handle settings number field by using dynamic props */}
                <InputNumber
                    min={ min }
                    max={ max }
                    disabled={ needUpgrade }
                    placeholder={ placeHolderText }
                    className={ `settings-field number-field` }
                    defaultValue={ fieldValue ? fieldValue : '' }
                    onChange={ ( event ) => changeHandler( name, event.target.value ) }
                />
            </Col>
        </FieldWrapper>
    );
}

export default Number;
