import { Tabs } from "antd";

const { TabPane } = Tabs;

const TabPanels = ( { tabPanels, activeTab, changeHandler, classes } ) => {
    return (
        // Handle settings tab & panels preview by using props.
        <Tabs className={ `${classes}` } activeKey={ activeTab } onTabClick={ changeHandler }>
            { tabPanels && tabPanels?.map( tab => (
                <TabPane tab={ tab?.title } key={ tab?.key }>
                    { tab?.panel }
                </TabPane>
            ) ) }
        </Tabs>
    );
}

export default TabPanels;
