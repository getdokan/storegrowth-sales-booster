import { Form, Select,Tabs } from 'antd';
import Template from './template/Template';
import ContentBump from './ContentBump';
import OverViewArea from './template/overview-area/OverViewArea';
const { TabPane } = Tabs;
const { Option } = Select;
const layout = {
  labelCol: {
    span: 8,
  },
  wrapperCol: {
    span: 12,
  },
};
const tailLayout = {
  wrapperCol: {
    offset: 8,
    span: 16,
  },
};

const AppearanceBump = ({onFormSave, buttonLoading}) => {

const onChange = (key) => {
    
    };

const [form] = Form.useForm();

 
return (
    <>
      <Tabs defaultActiveKey="10" onChange={onChange} >
          <TabPane tab="Template" key="10" >
              <Template/>
          </TabPane>

          <TabPane tab="Content" key="12">
              <div className="bump-template-main-wrapper">
                <div className="demo-template-design-change-area">
                <ContentBump/>
                </div>
                <OverViewArea/>
              </div>
              
          </TabPane>
      </Tabs>
    </>
  );
};

export default AppearanceBump;