import { Select, Typography } from 'antd';
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
    placeHolderText,
    colSpan = 24,
    needUpgrade = false
} ) => {
    return (
        // Make settings select component with card preview.
        <FieldWrapper colSpan={ colSpan }>
            <div className={ `card-heading` }>
                {/* Handle switcher title. */}
                <Title level={ 3 } className={ `settings-heading` }>{ title }</Title>
                {/* Handle switcher tooltip. */}
                { tooltip && <SettingsTooltip content={ tooltip } /> }
                {/* Handle switcher upgrade icon. */}
                { needUpgrade && <UpgradeCrown /> }
            </div>

            {/* Handle settings select field by using dynamic props */}
            <Select
                allowClear
                mode="multiple"
                options={ options }
                value={ fieldValue }
                style={{ width: '100%' }}
                placeholder={ placeHolderText }
                onChange={ ( v ) => changeHandler( name, v ) }
            />
        </FieldWrapper>
    );
}

export default SelectBox;
