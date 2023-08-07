import { useDispatch } from '@wordpress/data';
import { useState } from '@wordpress/element';
import { Button, Card, Col, Row, Space, Switch } from "antd";
import { Ajax } from '../../ajax';

function ModuleSwitch({ module }) {
  const { updateSingleModule, setPageLoading } = useDispatch( 'sgsb' );

  const onChange = (checked) => {
    setPageLoading(true);

    Ajax( 'update_module_status', {
      module_id: module.id,
      status: checked
    }).success((response) => {
      if (response.success) {
        updateSingleModule(module.id, checked);
        setPageLoading(false);
      }
    });
  }

  return (
    <Switch onChange={onChange} checked={module.status} />
  );
}

function ModuleCard( { module } ) {
  const [size, setSize] = useState(8);
  const {id} = module;

  let docSlug = id;
  if(id === "progressive-discount-banner"){
    docSlug = "discount-banner"
  }
  if(id === "fly-cart"){
    docSlug = "quick-cart"
  }

  return (
    <Col 
      span={8}
      style={{
        padding: '8px'
      }}
    >
      <Card
        bordered={false}
        className="sgsb-module-card"
        
        
      >
        <Row>
          <div className='module-banner'>
            <img width="410" src={module.banner} />
          </div>
        </Row>
        <Row justify="space-between" align="middle"
          style={{
            padding: '24px',
            paddingBottom: '0px',
          }}
        >
          <Col span={20}>
            <Space align='center'>
              <div className='module-thumb'>
                <img width="37" src={module.icon} />
              </div>
              <div className='module-name'>
                {module.name}
              </div>
            </Space>
          </Col>
        </Row>
        <Row>
          <Col span={24}>
            <div className='module-desc'>{module.description}</div>
          </Col>
        </Row>
        <Row
          style={{
            padding: '19px'
          }}
          className="sgsb__module-footer"
        >
          <Space align='center' size={size}>
            {
              module.status && (
                <Button
                  className='setting-btn footer-btn'
                  type="default"
                  shape="default"
                  href={ `admin.php?page=sgsb-settings#/${module?.id}` }
                >
                  Settings
                </Button>
              )
            }
           
            <Button
              className='doc-btn footer-btn'
              type="default"
              shape="default"
              href={`https://storegrowth.io/docs/${docSlug}/`}
              target='_blank'
            >
              Documentation
            </Button>
            <Col span={3} style={{ float: 'right' }} className='switch-btn'>
              <ModuleSwitch module={module} />
            </Col>
          </Space>
        </Row>
      </Card>
    </Col>
  );
}

export default ModuleCard;
