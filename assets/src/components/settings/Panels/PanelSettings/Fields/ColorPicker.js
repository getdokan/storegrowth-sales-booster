import { Typography, Col, ColorPicker } from 'antd';
import SettingsTooltip from "../SettingsTooltip";
import UpgradeCrown from "../UpgradeCrown";
import FieldWrapper from "./FieldWrapper";

const { Title } = Typography;

const ColourPicker = ( {
    name,
    title,
    tooltip,
    changeHandler,
    colSpan = 24,
    fieldValue = '#82B9FF',
    needUpgrade = false
} ) => {
    const colors = [
        '#000000',
        '#000000E0',
        '#000000A6',
        '#00000073',
        '#00000040',
        '#00000026',
        '#0000001A',
        '#00000012',
        '#0000000A',
        '#00000005',
        '#F5222D',
        '#FA8C16',
        '#FADB14',
        '#8BBB11',
        '#52C41A',
        '#13A8A8',
        '#1677FF',
        '#2F54EB',
        '#722ED1',
        '#EB2F96',
        '#F5222D4D',
        '#FA8C164D',
        '#FADB144D',
        '#8BBB114D',
        '#52C41A4D',
        '#13A8A84D',
        '#1677FF4D',
        '#2F54EB4D',
        '#722ED14D',
        '#EB2F964D',
    ];

    const presetColors = [ { colors } ];

    return (
        // Make settings color-picker component with card preview.
        <FieldWrapper colSpan={ colSpan } align={ 'center' }>
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
                {/* Handle settings color-picker field by using dynamic props */}
                <ColorPicker
                    value={ fieldValue }
                    presets={ presetColors }
                    disabled={ needUpgrade }
                    className={ `settings-field color-picker-field` }
                    onChange={ ( v, hex ) => changeHandler( name, hex ) }
                />
            </Col>
        </FieldWrapper>
    );
}

export default ColourPicker;
