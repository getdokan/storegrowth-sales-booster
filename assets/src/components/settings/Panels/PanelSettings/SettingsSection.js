import { Row } from 'antd';

const SettingsSection = ( { children, style = {} } ) => {
    return (
        // Used settings gutter for ensure fields proper spacing.
        <Row gutter={ [ 16, 16 ] } style={ { marginBottom: 40, position: 'relative', ...style } }>
            { children }
        </Row>
    );
}

export default SettingsSection;
