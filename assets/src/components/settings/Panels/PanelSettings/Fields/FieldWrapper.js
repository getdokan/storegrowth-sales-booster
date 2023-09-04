import { Card, Col } from 'antd';

const FieldWrapper = ( { colSpan, children } ) => {
    return (
        // Settings field wrapper component with card preview.
        <Col className="gutter-row" span={ colSpan }>
            <Card className={ `sgsb-settings-card` }>
                { children }
            </Card>
        </Col>
    );
}

export default FieldWrapper;
