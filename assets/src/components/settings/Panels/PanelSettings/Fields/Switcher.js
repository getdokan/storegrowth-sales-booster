import { Typography, Card, Switch, Col } from 'antd';
import { __ } from '@wordpress/i18n';
import SettingsTooltip from "../SettingsTooltip";
import UpgradeCrown from "../UpgradeCrown";

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
        <Col className="gutter-row" span={ colSpan }>
            <Card className={ `sgsb-settings-card` }>
                <Title level={ 3 } className={ `settings-heading` }>{ title }</Title>
                { tooltip && <SettingsTooltip content={ tooltip } /> }
                { needUpgrade && <UpgradeCrown /> }
                <Switch
                    checked={ isEnable }
                    disabled={ needUpgrade }
                    className={ `settings-field` }
                    onChange={ ( value ) => changeHandler( name, value ) }
                    checkedChildren={ __( 'Enable', 'storegrowth-sales-booster' ) }
                    unCheckedChildren={ __( 'Disable', 'storegrowth-sales-booster' ) }
                />
            </Card>
        </Col>
    );
}

export default Switcher;
