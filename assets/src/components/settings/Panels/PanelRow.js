import { Row } from 'antd';

const PanelRow = ( { children } ) => {
    return (
        <Row className={ `panel-row` }>
            { children }
        </Row>
    );
}

export default PanelRow;
