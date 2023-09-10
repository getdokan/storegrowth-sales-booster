import { Typography } from 'antd';
import UpgradeCrown from "./PanelSettings/UpgradeCrown";

const { Title } = Typography;

const SectionHeader = ( { title, showUpgrade } ) => {
    return (
        <div className={ `section-header` }>
            {/* Render section heading with divider. */}
            <Title level={ 4 } className={ `section-heading` }>
                { title }
            </Title>
            { showUpgrade && <UpgradeCrown /> }
        </div>
    );
}

export default SectionHeader;
