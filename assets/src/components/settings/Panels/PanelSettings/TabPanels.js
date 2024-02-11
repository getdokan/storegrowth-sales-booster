import { Tabs } from "antd";

const { TabPane } = Tabs;

const TabPanels = ( { tabPanels, activeTab, changeHandler, classes, undoHandler, showUndoIcon = false } ) => {
    return (
        // Handle settings tab & panels preview by using props.
        <Tabs
            className={ `${classes}` }
            activeKey={ activeTab }
            onTabClick={ changeHandler }
            tabBarExtraContent={ {
                right: showUndoIcon && ( <span onClick={ undoHandler } className="dashicons dashicons-undo"></span> )
            } }
        >
            { tabPanels && tabPanels?.map( tab => (
                <TabPane tab={ tab?.title } key={ tab?.key }>
                    { tab?.panel }
                </TabPane>
            ) ) }
        </Tabs>
    );
}

export default TabPanels;
