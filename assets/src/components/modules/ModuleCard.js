import { useDispatch } from '@wordpress/data';
import { Card, Row, Col } from "antd";
import { Switch } from "antd";
import Swal from 'sweetalert2'

import { Ajax } from '../../ajax';

function ModuleSwitch({ module }) {
  const { updateSingleModule, setPageLoading } = useDispatch( 'spsb' );

  const showSuccessModal = ( module ) => {
    Swal.fire({
      title: 'Success!',
      text: module.name + ' module has been activated successfully, You can now update module settings.',
      icon: 'success',
      confirmButtonText: 'View Settings'
    }).then((result) => {
      if (result.isConfirmed) {
        location.href = "admin.php?page=spsb-settings#/" + module.id;
      }
    });
  };

  const onChange = (checked) => {
    setPageLoading(true);

    Ajax( 'update_module_status', {
      module_id: module.id,
      status: checked
    }).success((response) => {
      if (response.success) {
        updateSingleModule(module.id, checked);
        setPageLoading(false);
        if ( checked ) {
          showSuccessModal( module );
        }
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
        className="spsb-module-card"
      >
        <Row>
          <Col span={7}>
            <img src={module.icon} />
          </Col>
          <Col offset={1} span={16}>
            <div>{module.description}</div>
          </Col>
        </Row>
      </Card>
    </Col>
  );
}

export default ModuleCard;
