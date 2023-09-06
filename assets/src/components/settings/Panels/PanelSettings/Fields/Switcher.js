import { Typography, Switch, Col } from 'antd';
import SettingsTooltip from "../SettingsTooltip";
import UpgradeCrown from "../UpgradeCrown";
import { __ } from '@wordpress/i18n';
import FieldWrapper from "./FieldWrapper";

const { Title } = Typography;

const Switcher = ( {
    name,
    title,
    tooltip,
    changeHandler,
    colSpan = 24,
    isEnable = true,
    needUpgrade = false
} ) => {
    return (
        // Make settings switcher component with card preview.
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
                {/* Handle settings switcher field by using dynamic props */}
                <Switch
                    checked={ isEnable }
                    disabled={ needUpgrade }
                    className={ `settings-field switcher-field` }
                    onChange={ ( value ) => changeHandler( name, value ) }
                    checkedChildren={ __( 'Enable', 'storegrowth-sales-booster' ) }
                    unCheckedChildren={ __( 'Disable', 'storegrowth-sales-booster' ) }
                />
            </Col>
        </FieldWrapper>
    );
}

export default Switcher;
