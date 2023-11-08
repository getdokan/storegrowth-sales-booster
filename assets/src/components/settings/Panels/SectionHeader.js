import { Typography } from 'antd';
import UpgradeCrown from "./PanelSettings/UpgradeCrown";
import SettingsTooltip from "./PanelSettings/SettingsTooltip";

const { Title } = Typography;

const SectionHeader = ( { title, tooltip, showUpgrade } ) => {
    return (
        <div className={ `section-header` }>
            {/* Render section heading with divider. */}
            <Title level={ 4 } className={ `section-heading` }>
                { title }
            </Title>
            { tooltip && <SettingsTooltip content={ tooltip } /> }
            { showUpgrade && <UpgradeCrown proBadge={ false } /> }
        </div>
    );
}

export default SectionHeader;
