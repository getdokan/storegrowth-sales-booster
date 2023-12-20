import FieldWrapper from './FieldWrapper';
import UpgradeCrown from '../UpgradeCrown';
import {Button, Typography, Col, Radio} from 'antd';
import SettingsTooltip from '../SettingsTooltip';
import UpgradeOverlay from '../UpgradeOverlay';
import {__} from '@wordpress/i18n';
import React, {Fragment} from "react";

const { Title } = Typography;

const TextRadioBox = ( {
    name,
    title,
    classes,
    tooltip,
    options,
    fieldWidth,
    fieldValue,
    changeHandler,
    colSpan = 24,
    needUpgrade = false,
} ) => {

    return (
        // Make settings radio component with card preview.
        <FieldWrapper colSpan={ colSpan } align={ 'center' } upgradeClass={ needUpgrade ? `upgrade-settings` : '' }>
            <Col span={ 9 }>
                <div className={ `card-heading` }>
                    {/* Handle switcher title. */}
                    <Title level={ 3 } className={ `settings-heading` }>{ title }</Title>
                    {/* Handle switcher tooltip. */}
                    { tooltip && <SettingsTooltip content={ tooltip } /> }
                    {/* Handle switcher upgrade icon. */}
                    { needUpgrade && !fieldWidth && <UpgradeCrown /> }
                </div>
            </Col>
            { fieldWidth ? (
                <Radio.Group
                    buttonStyle='solid'
                    value={ fieldValue }
                    className={ `settings-field radio-field ${ classes }` }
                    onChange={ ( v ) => changeHandler( name, v?.target?.value ) }
                >
                    {/* Handle settings radio field by using dynamic props */}
                    { options && options?.length > 0 && options?.map( option => (
                        <Col key={option.key} span={ 12 } style={ { maxWidth: '100%', position: 'relative' } } className={ `${ option?.disabled ? 'disabled-settings' : ''  }` }>
                            <Radio
                                value={ option?.key }
                                disabled={ option?.disabled }
                            >
                                { option?.value }
                            </Radio>
                            { option?.disabled && <UpgradeOverlay /> }
                        </Col>
                    ) ) }
                </Radio.Group>
            ) : (
                <Col
                    span={ 15 }
                    style={ { display: 'flex', justifyContent: 'start', alignItems: 'center', gap: 12 } }
                >
                    {/* Handle settings radio field by using dynamic props */}
                    { options && options?.length > 0 && (
                        <Radio.Group
                            buttonStyle='solid'
                            value={ fieldValue }
                            // className={ `settings-field radio-field ${ classes }` }
                            onChange={ ( v ) => changeHandler( name, v?.target?.value ) }
                        >
                            { options?.map(
                                option => <Radio key={option?.key} disabled={ option?.disabled } value={ option?.key }>{ option?.value }</Radio>
                            ) }
                        </Radio.Group>
                    ) }
                </Col>
            ) }
            { needUpgrade && <UpgradeOverlay /> }
        </FieldWrapper>
    );
}

export default TextRadioBox;
