import { Row } from 'antd';

const SettingsSection = ( { children } ) => {
    return (
        // Used settings gutter for ensure fields proper spacing.
        <Row gutter={ [ 16, 16 ] }>
            { children }
        </Row>
    );
}

export default SettingsSection;
