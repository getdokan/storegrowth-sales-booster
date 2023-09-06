import { Select, Typography, Col } from 'antd';
import SettingsTooltip from "../SettingsTooltip";
import UpgradeCrown from "../UpgradeCrown";
import FieldWrapper from "./FieldWrapper";

const { Title } = Typography;

const MultiSelectBox = ({
    name,
    title,
    tooltip,
    options,
    fieldValue,
    changeHandler,
    placeHolderText,
    colSpan = 24,
    needUpgrade = false
} ) => {
    return (
        // Make settings multi-select component with card preview.
        <FieldWrapper colSpan={ colSpan }>
            <Col span={9}>
                <div className={ `card-heading` }>
                    {/* Handle switcher title. */}
                    <Title level={ 3 } className={ `settings-heading` }>{ title }</Title>
                    {/* Handle switcher tooltip. */}
                    { tooltip && <SettingsTooltip content={ tooltip } /> }
                    {/* Handle switcher upgrade icon. */}
                    { needUpgrade && <UpgradeCrown /> }
                </div>
            </Col>
            <Col span={15}>
                {/* Handle settings multi-select field by using dynamic props */}
                <Select
                    allowClear
                    mode="multiple"
                    options={ options }
                    value={ fieldValue }
                    style={{ width: '100%' }}
                    placeholder={ placeHolderText }
                    className={ `settings-field select-field` }
                    onChange={ ( v ) => changeHandler( name, v ) }
                />
            </Col>
        </FieldWrapper>
    );
}

export default MultiSelectBox;
