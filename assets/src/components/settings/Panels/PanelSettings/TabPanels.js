import { Tabs } from "antd";
import {__} from "@wordpress/i18n";
import {Fragment} from "react";

const { TabPane } = Tabs;

const TabPanels = ( { tabPanels, activeTab, changeHandler, classes } ) => {
    return (
        // Handle settings tab & panels preview by using props.
        <Tabs
            className={ `${classes}` }
            activeKey={ activeTab }
            onTabClick={ changeHandler }
        >
            { tabPanels && tabPanels?.map( tab => (
                <TabPane
                    key={ tab?.key }
                    tab={ (
                        <span className={ `${ tab?.proBadge ? 'prompt-tab' : 'sgsb-tab' }` }>
                            { tab?.title }
                            { tab?.proBadge && (
                                <span className='sgsb-pro-badge'>
                                    {__( 'PRO', 'storegrowth-sales-booster' )}
                                </span>
                            ) }
                        </span>
                    ) }
                >
                    { tab?.panel }
                </TabPane>
            ) ) }
        </Tabs>
    );
}

export default TabPanels;
