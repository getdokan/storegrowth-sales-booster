import { Tabs,Card } from 'antd';
const { TabPane } = Tabs;
import { __ } from '@wordpress/i18n';
import OrderBumpGlobalSettings from './OrderBumpGlobalSettings';
import PanelHeader from "sales-booster/src/components/settings/Panels/PanelHeader";
import PanelContainer from "sales-booster/src/components/settings/Panels/PanelContainer";
import PanelRow from "sales-booster/src/components/settings/Panels/PanelRow";
import PanelSettings from "sales-booster/src/components/settings/Panels/PanelSettings";
import PanelPreview from "sales-booster/src/components/settings/Panels/PanelPreview";
import Preview from "sales-booster-sales-pop/src/components/Preview";
import CreateBumpButton from "./CreateBumpButton";

function OrderBump({ outlet: Outlet, navigate }) {

    const onChange = (key) => {
        if(key=='order_bump_list'){
            navigate("/upsell-order-bump");
        }

    };

    return (
        // <Card className='tab-pan-wrapper'>
        //     <Tabs defaultActiveKey="order_bump_list" onTabClick={onChange} >
        //         <TabPane tab="Order Bumps List" key="order_bump_list" >
        //             <Outlet />
        //         </TabPane>
        //         {/*<TabPane tab="Global Settings" key="2" >
        //             <OrderBumpGlobalSettings/>
        //         </TabPane>
        //         */}
        //     </Tabs>
        // </Card>
        <>
            <PanelHeader title={ __( 'Order Bumps List', 'storegrowth-sales-booster' ) }>
                <CreateBumpButton navigate={ navigate } />
            </PanelHeader>
            <PanelContainer classes={ `space-top` }>
                <Outlet />
            </PanelContainer>
            {/*<PanelContainer>*/}
            {/*    <PanelRow>*/}
            {/*        <PanelSettings*/}
            {/*            colSpan={ showPreview && tabName ? 15 : 24 }*/}
            {/*            tabPanels={ tabPanels }*/}
            {/*            changeHandler={ changeTab }*/}
            {/*            activeTab={ tabName ? tabName : 'general' }*/}
            {/*        />*/}
            {/*        { showPreview && tabName && (*/}
            {/*            <PanelPreview colSpan={ 9 }>*/}
            {/*                <Preview storeData={ createPopupForm } />*/}
            {/*            </PanelPreview>*/}
            {/*        ) }*/}
            {/*    </PanelRow>*/}
            {/*</PanelContainer>*/}
        </>
    );
  }

export default OrderBump;
