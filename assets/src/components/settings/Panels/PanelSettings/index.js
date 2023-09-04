import { Col } from 'antd';
import TabPanels from "./TabPanels";

const PanelSettings = ( {
    tabPanels,
    activeTab,
    changeHandler,
    colSpan = 12
} ) => {
    return (
        <Col span={ colSpan } className={ `panel-column` }>
            <TabPanels
                tabPanels={ tabPanels }
                activeTab={ activeTab }
                classes={ `settings-panel ${ colSpan === 24 ? 'full-width' : '' }` }
                changeHandler={ changeHandler }
            />
        </Col>
    );
}

export default PanelSettings;
