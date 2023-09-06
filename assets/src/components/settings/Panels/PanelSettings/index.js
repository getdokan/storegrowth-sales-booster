import { Col } from 'antd';
import TabPanels from "./TabPanels";

const PanelSettings = ( {
    tabPanels,
    activeTab,
    changeHandler,
    colSpan = 12
} ) => {
    return (
        // Handle settings column width dynamically by using colSpan.
        <Col span={ colSpan } className={ `panel-column` }>
            {/* Render tabs preview by using tabPanels prop. */}
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
