import {Typography, Col, Card, Row} from "antd";
import FieldWrapper from "sales-booster/src/components/settings/Panels/PanelSettings/Fields/FieldWrapper";
import SettingsTooltip from "sales-booster/src/components/settings/Panels/PanelSettings/SettingsTooltip";
import UpgradeCrown from "sales-booster/src/components/settings/Panels/PanelSettings/UpgradeCrown";
import CartContent from "./CartContent";
import UpgradeOverlay from "sales-booster/src/components/settings/Panels/PanelSettings/UpgradeOverlay";

const { Title } = Typography;

const ContentGroup = ( {
    title,
    options,
    tooltip,
    formData,
    needUpgrade,
    changeHandler
} ) => {
    return (
        // Make settings checkbox component with card preview.
        <FieldWrapper colSpan={24}>
            <Col span={24}>
                <div className={`card-heading checkbox-heading`}>
                    {/* Handle checkbox title. */}
                    <Title level={3} className={`settings-heading`}>
                        {title}
                    </Title>
                    {/* Handle checkbox tooltip. */}
                    {tooltip && <SettingsTooltip content={tooltip} />}
                    {/* Handle checkbox settings upgrade icon. */}
                    {needUpgrade && <UpgradeCrown />}
                </div>
            </Col>

            {/* Content settings field wrapper component with card preview. */}
            <Row
                gutter={ [ 0, 12 ] }
                style={ { marginTop: 20 } }
            >
                { options && options?.map( ( option, index ) => (
                    <Col
                        span={ 12 }
                        className="gutter-row"
                        style={ {
                            paddingLeft: ( index % 2 === 0 ) ? 0 : 6,
                            paddingRight: ( index % 2 !== 0 ) ? 0 : 6,
                        } }
                    >
                        <Card
                            className={ `sgsb-settings-card content-group-settings ${ option?.needUpgrade ? 'disabled-settings' : '' }` }
                            style={ { background: formData?.[ option?.name ] && !option?.needUpgrade ? '#F4F7FF' : '#FFF' } }
                        >
                            <Row justify={ `start` } align={ `middle` }>
                                <CartContent
                                    colSpan={ 12 }
                                    name={ option?.name }
                                    title={ option?.title }
                                    changeHandler={ changeHandler }
                                    needUpgrade={ option?.needUpgrade }
                                    checkedValue={ formData?.[ option?.name ] }
                                    className={ `settings-field checkbox-field` }
                                />
                            </Row>
                            { option?.needUpgrade && <UpgradeOverlay /> }
                        </Card>
                    </Col>
                ) ) }
            </Row>
        </FieldWrapper>
    );
}

export default ContentGroup;
