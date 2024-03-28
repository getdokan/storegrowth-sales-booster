import FieldWrapper from './FieldWrapper';
import UpgradeCrown from '../UpgradeCrown';
import {Button, Typography, Col, Radio} from 'antd';
import SettingsTooltip from '../SettingsTooltip';
import UpgradeOverlay from '../UpgradeOverlay';
import {__} from '@wordpress/i18n';
import React, {Fragment} from "react";

const { Title } = Typography;

const RadioBox = ( {
    name,
    title,
    classes,
    tooltip,
    options,
    fieldWidth,
    fieldValue,
    customValue,
    uploadOption,
    uploadHandler,
    changeHandler,
    iconRemoveHandler,
    colSpan = 24,
    needUpgrade = false,
} ) => {

    return (
        // Make settings radio component with card preview.
        <FieldWrapper colSpan={ colSpan } align={ 'center' } upgradeClass={ needUpgrade ? `upgrade-settings` : '' }>
            <Col span={ fieldWidth ? 24 : 9 }>
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
                            <Radio.Button
                                value={ option?.key }
                                disabled={ option?.disabled }
                            >
                                { option?.value }
                            </Radio.Button>
                            { option?.disabled && <UpgradeOverlay /> }
                        </Col>
                    ) ) }
                </Radio.Group>
            ) : (
                <Col
                    span={ 15 }
                    style={ { display: 'flex', justifyContent: 'end', alignItems: 'center', gap: 12 } }
                >
                    {/* Handle settings radio field by using dynamic props */}
                    { options && options?.length > 0 && (
                        <Radio.Group
                            buttonStyle='solid'
                            value={ fieldValue }
                            className={ `settings-field radio-field ${ classes }` }
                            onChange={ ( v ) => changeHandler( name, v?.target?.value ) }
                        >
                            { options?.map(
                                option => <Radio.Button key={option?.key} disabled={ option?.disabled } value={ option?.key }>{ option?.value }</Radio.Button>
                            ) }
                        </Radio.Group>
                    ) }
                    {/* Render media upload button for custom selection */}
                    { uploadOption && (
                        <Fragment>
                            { uploadOption !== 'pro' && customValue && (
                                <Radio.Group
                                    buttonStyle='solid'
                                    value={ fieldValue }
                                    className={ `settings-field radio-field custom-field ${ classes }` }
                                >
                                    <Radio.Button>
                                        <div className='clear-upload' onClick={ iconRemoveHandler }>
                                            <span className='clear-icon'>
                                                <span style={ { marginTop: 1 } }>x</span>
                                            </span>
                                        </div>
                                        <img
                                            width={ 22 }
                                            height={ 22 }
                                            src={ customValue }
                                            alt={ __( 'Custom Icon', 'storegrowth-sales-booster' ) }
                                        />
                                    </Radio.Button>
                                </Radio.Group>
                            ) }
                            <Button
                                onClick={ uploadHandler }
                                className={ `media-button ${ uploadOption !== 'pro' && customValue ? 'active' : '' }` }
                            >
                                <svg width='14' height='16' viewBox='0 0 14 16' fill='none' xmlns='http://www.w3.org/2000/svg'>
                                    <g opacity='0.3'>
                                        <path
                                            fill='#073B4C'
                                            fillRule='evenodd'
                                            clipRule='evenodd'
                                            d='M6.71967 1.09467C7.01256 0.801777 7.48744 0.801777 7.78033 1.09467L11.5303 4.84467C11.8232 5.13756 11.8232 5.61244 11.5303 5.90533C11.2374 6.19822 10.7626 6.19822 10.4697 5.90533L8 3.43566V10.625C8 11.0392 7.66421 11.375 7.25 11.375C6.83579 11.375 6.5 11.0392 6.5 10.625V3.43566L4.03033 5.90533C3.73744 6.19822 3.26256 6.19822 2.96967 5.90533C2.67678 5.61244 2.67678 5.13756 2.96967 4.84467L6.71967 1.09467ZM1.25 10.625C1.66421 10.625 2 10.9608 2 11.375V12.875C2 13.0739 2.07902 13.2647 2.21967 13.4053C2.36032 13.546 2.55109 13.625 2.75 13.625H11.75C11.9489 13.625 12.1397 13.546 12.2803 13.4053C12.421 13.2647 12.5 13.0739 12.5 12.875V11.375C12.5 10.9608 12.8358 10.625 13.25 10.625C13.6642 10.625 14 10.9608 14 11.375V12.875C14 13.4717 13.7629 14.044 13.341 14.466C12.919 14.8879 12.3467 15.125 11.75 15.125H2.75C2.15326 15.125 1.58097 14.8879 1.15901 14.466C0.737053 14.044 0.5 13.4717 0.5 12.875V11.375C0.5 10.9608 0.835786 10.625 1.25 10.625Z'
                                        />
                                        <path
                                            fill='black'
                                            fillOpacity='0.2'
                                            fillRule='evenodd'
                                            clipRule='evenodd'
                                            d='M6.71967 1.09467C7.01256 0.801777 7.48744 0.801777 7.78033 1.09467L11.5303 4.84467C11.8232 5.13756 11.8232 5.61244 11.5303 5.90533C11.2374 6.19822 10.7626 6.19822 10.4697 5.90533L8 3.43566V10.625C8 11.0392 7.66421 11.375 7.25 11.375C6.83579 11.375 6.5 11.0392 6.5 10.625V3.43566L4.03033 5.90533C3.73744 6.19822 3.26256 6.19822 2.96967 5.90533C2.67678 5.61244 2.67678 5.13756 2.96967 4.84467L6.71967 1.09467ZM1.25 10.625C1.66421 10.625 2 10.9608 2 11.375V12.875C2 13.0739 2.07902 13.2647 2.21967 13.4053C2.36032 13.546 2.55109 13.625 2.75 13.625H11.75C11.9489 13.625 12.1397 13.546 12.2803 13.4053C12.421 13.2647 12.5 13.0739 12.5 12.875V11.375C12.5 10.9608 12.8358 10.625 13.25 10.625C13.6642 10.625 14 10.9608 14 11.375V12.875C14 13.4717 13.7629 14.044 13.341 14.466C12.919 14.8879 12.3467 15.125 11.75 15.125H2.75C2.15326 15.125 1.58097 14.8879 1.15901 14.466C0.737053 14.044 0.5 13.4717 0.5 12.875V11.375C0.5 10.9608 0.835786 10.625 1.25 10.625Z'
                                        />
                                        <path
                                            fill='black'
                                            fillOpacity='0.2'
                                            fillRule='evenodd'
                                            clipRule='evenodd'
                                            d='M6.71967 1.09467C7.01256 0.801777 7.48744 0.801777 7.78033 1.09467L11.5303 4.84467C11.8232 5.13756 11.8232 5.61244 11.5303 5.90533C11.2374 6.19822 10.7626 6.19822 10.4697 5.90533L8 3.43566V10.625C8 11.0392 7.66421 11.375 7.25 11.375C6.83579 11.375 6.5 11.0392 6.5 10.625V3.43566L4.03033 5.90533C3.73744 6.19822 3.26256 6.19822 2.96967 5.90533C2.67678 5.61244 2.67678 5.13756 2.96967 4.84467L6.71967 1.09467ZM1.25 10.625C1.66421 10.625 2 10.9608 2 11.375V12.875C2 13.0739 2.07902 13.2647 2.21967 13.4053C2.36032 13.546 2.55109 13.625 2.75 13.625H11.75C11.9489 13.625 12.1397 13.546 12.2803 13.4053C12.421 13.2647 12.5 13.0739 12.5 12.875V11.375C12.5 10.9608 12.8358 10.625 13.25 10.625C13.6642 10.625 14 10.9608 14 11.375V12.875C14 13.4717 13.7629 14.044 13.341 14.466C12.919 14.8879 12.3467 15.125 11.75 15.125H2.75C2.15326 15.125 1.58097 14.8879 1.15901 14.466C0.737053 14.044 0.5 13.4717 0.5 12.875V11.375C0.5 10.9608 0.835786 10.625 1.25 10.625Z'
                                        />
                                    </g>
                                </svg>
                                { __( 'Upload', 'storegrowth-sales-booster' ) }
                                { uploadOption === 'pro' && <UpgradeCrown proCrown={ false } /> }
                                { uploadOption === 'pro' && <UpgradeOverlay /> }
                            </Button>
                        </Fragment>
                    ) }
                </Col>
            ) }
            { needUpgrade && <UpgradeOverlay /> }
        </FieldWrapper>
    );
}

export default RadioBox;
