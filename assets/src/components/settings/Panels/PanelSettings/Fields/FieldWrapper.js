import { Card, Row, Col } from 'antd';

const FieldWrapper = ( { colSpan, children, align = 'top' } ) => {
    return (
        // Settings field wrapper component with card preview.
        <Col className="gutter-row" span={ colSpan }>
            <Card className={ `sgsb-settings-card` }>
                <Row justify="center" align={ align }>
                    { children }
                </Row>
            </Card>
        </Col>
    );
}

export default FieldWrapper;
