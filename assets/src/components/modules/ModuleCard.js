import { useDispatch } from '@wordpress/data';
import { useState } from '@wordpress/element';
import { Button, Card, Col, Image, Row, Space, Switch } from "antd";
import { Ajax } from '../../ajax';
import { __ } from '@wordpress/i18n';

function ModuleSwitch({ module }) {
  const { updateSingleModule, setPageLoading } = useDispatch( 'spsg' );

  const onChange = (checked) => {
    setPageLoading(true);

    Ajax( 'update_module_status', {
      module_id: module.id,
      status: checked
    }).then((response) => {
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
  const idToDocSlugMapping = {
    "progressive-discount-banner": "free-shipping-bar",
    "fly-cart": "quick-cart",
    "floating-notification-bar": "floating-bar",
    "countdown-timer": "sales-countdown",
  };
  
  let docSlug = idToDocSlugMapping[id] || id;

  return (
    <Col
      xs={24}
      xl={8}
      md={24}
      style={{
        padding: '8px'
      }}
    >
      <Card
        bordered={false}
        className="spsg-module-card"
        
        
      >
        <Row>
          <div className='module-banner'>
            <Image
              preview={false}
              width={329}
              src={module.banner}
            />
            
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
                <Image
                  preview={false}
                  width={37}
                  src={module.icon}
                />
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
          className="spsg__module-footer"
        >
          <Space align='center' size={size}>
           <div className='doc-btn'>
            {
                module.status && (
                  <Button
                    className='setting-btn footer-btn'
                    type="default"
                    shape="default"
                    href={ `admin.php?page=spsg-settings#/${module?.id}` }
                  >
                    Settings
                  </Button>
                )
              }
            
              <Button
                className='doc-btn footer-btn'
                type="default"
                shape="default"
                href={ module.doc_link || `https://storegrowth.io/docs/` }
                target='_blank'
              >
                { __( 'Documentation', 'storegrowth-sales-booster' ) }
              </Button>
          </div>
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
