import { Select, Typography, Col } from 'antd';
import SettingsTooltip from "../SettingsTooltip";
import UpgradeCrown from "../UpgradeCrown";
import FieldWrapper from "./FieldWrapper";

const { Title } = Typography;

const SelectBox = ( {
    name,
    title,
    tooltip,
    options,
    fieldValue,
    changeHandler,
    colSpan = 24,
    needUpgrade = false
} ) => {
    return (
        // Make settings select component with card preview.
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
                {/* Handle settings select field by using dynamic props */}
                <Select
                    options={ options }
                    value={ fieldValue }
                    style={{ width: colSpan === 24 ? 170 : 70 }}
                    disabled={ needUpgrade }
                    onChange={ ( v ) => changeHandler( name, v ) }
                    className={ `settings-field single-select-field` }
                />
            </Col>
        </FieldWrapper>
    );
}

export default SelectBox;
