import { Typography, Divider } from 'antd';

const { Title } = Typography;

const PanelHeader = ( { title, children } ) => {
    return (
        <div className={ `panel-header` }>
            {/* Render settings heading with divider. */}
            <Title level={ 3 } className={ `header-content` }>
                { title } { children }
            </Title>
            <Divider className={ `header-divider` } />
        </div>
    );
}

export default PanelHeader;
