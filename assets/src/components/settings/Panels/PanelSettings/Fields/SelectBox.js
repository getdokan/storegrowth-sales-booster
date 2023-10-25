import {Select, Typography, Col, InputNumber} from 'antd';
import SettingsTooltip from "../SettingsTooltip";
import UpgradeCrown from "../UpgradeCrown";
import FieldWrapper from "./FieldWrapper";
import UpgradeOverlay from "../UpgradeOverlay";
import React from "react";

const { Title } = Typography;

const SelectBox = ( {
    name,
    title,
    classes,
    tooltip,
    options,
    fieldWidth,
    fieldValue,
    filterOption,
    changeHandler,
    placeHolderText,
    colSpan = 24,
    showSearch = false,
    needUpgrade = false,
} ) => {
    return (
        // Make settings select component with card preview.
        <FieldWrapper colSpan={ colSpan } align={ 'center' } upgradeClass={ needUpgrade ? `upgrade-settings` : '' }>
            <Col span={ fieldWidth ? 9 : 15 }>
                <div className={ `card-heading` }>
                    {/* Handle switcher title. */}
                    <Title level={ 3 } className={ `settings-heading` }>{ title }</Title>
                    {/* Handle switcher tooltip. */}
                    { tooltip && <SettingsTooltip content={ tooltip } /> }
                    {/* Handle switcher upgrade icon. */}
                    { needUpgrade && <UpgradeCrown /> }
                </div>
            </Col>
            <Col span={ fieldWidth ? 15 : 9 }>
                {/* Handle settings select field by using dynamic props */}
                <Select
                    value={ fieldValue }
                    disabled={ needUpgrade }
                    showSearch={ showSearch }
                    placeholder={ placeHolderText }
                    onChange={ ( v ) => changeHandler( name, v ) }
                    filterOption={ filterOption ? filterOption : true }
                    className={ `settings-field single-select-field ${ classes }` }
                    style={{ width: fieldWidth ? fieldWidth : ( colSpan === 24 ? 170 : 70 ) }}
                >
                    { options && options.map( option => (
                        <Select.Option key={ option?.value } disabled={option?.disabled}>
                            { option?.label }
                            { option?.needUpgrade && <UpgradeCrown /> }
                            { option?.needUpgrade && <UpgradeOverlay /> }
                        </Select.Option>
                    ) ) }
                </Select>
            </Col>
            { needUpgrade && <UpgradeOverlay /> }
        </FieldWrapper>
    );
}

export default SelectBox;
