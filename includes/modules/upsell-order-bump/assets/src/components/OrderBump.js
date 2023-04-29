import {Tabs,Card } from 'antd';
const { TabPane } = Tabs;
import OrderBumpGlobalSettings from './OrderBumpGlobalSettings';

function OrderBump({ outlet: Outlet, navigate }) {

    const onChange = (key) => {
        if(key=='order_bump_list'){
            navigate("/upsell-order-bump");
        }

    };

    return (
        <Card className='tab-pan-wrapper'>
            <Tabs defaultActiveKey="order_bump_list" onTabClick={onChange} >
                <TabPane tab="Order Bumps List" key="order_bump_list" >
                    <Outlet />
                </TabPane>
                {/*<TabPane tab="Global Settings" key="2" >
                    <OrderBumpGlobalSettings/>
                </TabPane>
                */}
            </Tabs>
        </Card>
    );
  }

export default OrderBump;
