import { Typography, Divider } from 'antd';

const { Title } = Typography;

const PanelHeader = ( { title } ) => {
    return (
        <div className={ `panel-header` }>
            <Title level={ 3 } className={ `header-content` }>
                { title }
            </Title>
            <Divider className={ `header-divider` } />
        </div>
    );
}

export default PanelHeader;
