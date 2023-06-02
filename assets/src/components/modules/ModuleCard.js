import { useDispatch } from '@wordpress/data';
import { Card, Row, Col } from "antd";
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
  return (
    <Col span={8}>
      <Card
        title={module.name}
        bordered={false}
        extra={<ModuleSwitch module={module} />}
        className="sgsb-module-card"
      >
        <Row>
          <Col span={7}>
            <img src={module.icon} />
          </Col>
          <Col offset={1} span={16}>
            <div>{module.description}</div>
          </Col>
        </Row>
        <Divider orientation="left/right" />
        <Row>
          <Col span={7}>
            <Button
              type="default"
              shape="round"
              href="admin.php?page=sgsb-settings"
            >
              Settings
            </Button>
          </Col>
        </Row>
      </Card>
    </Col>
  );
}

export default ModuleCard;
