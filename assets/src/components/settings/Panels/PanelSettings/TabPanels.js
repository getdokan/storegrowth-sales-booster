import { Tabs } from "antd";
import {__} from "@wordpress/i18n";
import {Fragment} from "react";

const TabPanels = ( { tabPanels, activeTab, changeHandler, classes } ) => {
    // Convert tabPanels to items format for new Tabs API
    const items = tabPanels?.map( tab => ({
        key: tab?.key,
        label: (
            <span className={ `${ tab?.proBadge ? 'prompt-tab' : 'spsg-tab' }` }>
                { tab?.title }
                { tab?.proBadge && (
                    <span className='spsg-pro-badge'>
                        {__( 'PRO', 'storegrowth-sales-booster' )}
                    </span>
                ) }
            </span>
        ),
        children: tab?.panel,
    })) || [];

    return (
        // Handle settings tab & panels preview by using props.
        <Tabs
            className={ `${classes}` }
            activeKey={ activeTab }
            onTabClick={ changeHandler }
            items={ items }
        />
    );
}

export default TabPanels;
