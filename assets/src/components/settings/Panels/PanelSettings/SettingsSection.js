import { Row } from 'antd';

const SettingsSection = ( { children } ) => {
    return (
        <Row gutter={ [ 16, 16 ] }>
            { children }
        </Row>
    );
}

export default SettingsSection;
