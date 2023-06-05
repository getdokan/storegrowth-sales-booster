import { useDispatch } from '@wordpress/data';
import { useState } from '@wordpress/element';
import { Card, Row, Col, Space } from "antd";
import { Switch, Button, Divider } from "antd";
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
  const [size, setSize] = useState(16);

  return (
    <Col span={8}>
      <Card
        bordered={false}
        className="sgsb-module-card"
        
      >
        <Row justify="space-between" align="middle"
          style={{
            padding: '24px',
            paddingBottom: '0px',
          }}
        >
          <Col span={20}>
            <Space align='center'>
              <div className='module-thumb'>
                <img src={module.icon} />
              </div>
              <div className='module-name'>
                {module.name}
              </div>
            </Space>
          </Col>
          <Col span={3} style={{ float: 'right' }}>
            <ModuleSwitch module={module} />
          </Col>
        </Row>
        <Divider orientation="left/right" />
        <Row>
          <Col span={24}>
            <div className='module-desc'>{module.description}</div>
          </Col>
        </Row>
        <Row
          style={{
            padding: '24px',
          }}
        >
          <Space align='center' size={size}>
            <Button
                type="default"
                shape="default"
                href="admin.php?page=sgsb-settings"
              >
                Settings
              </Button>
              <Button
                type="default"
                shape="default"
                href="#"
              >
                Documentation
              </Button>
          </Space>
        </Row>
      </Card>
    </Col>
  );
}

export default ModuleCard;
