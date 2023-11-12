import { Card, Row, Col } from "antd";
import UpgradeOverlay from "../UpgradeOverlay";

const FieldWrapper = ({
    colSpan,
    children,
    upgradeClass,
    align = "top",
    justify = "center",
}) => {
    return (
        // Settings field wrapper component with card preview.
        <Col className="gutter-row" span={colSpan}>
            <Card className={`sgsb-settings-card ${upgradeClass}`}>
                <Row justify={justify} align={align}>
                    {children}
                </Row>
                {upgradeClass && <UpgradeOverlay />}
            </Card>
        </Col>
    );
};

export default FieldWrapper;
