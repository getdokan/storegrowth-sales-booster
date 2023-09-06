import { Row } from 'antd';

const PanelRow = ( { children } ) => {
    return (
        // Render panel row for handling section divisor.
        <Row className={ `panel-row` }>
            { children }
        </Row>
    );
}

export default PanelRow;
