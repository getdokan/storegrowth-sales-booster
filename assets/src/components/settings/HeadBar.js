import { Layout } from "antd";
import { Button, Col, Image, Row } from "antd";
import helpIcon from "../../../images/help-icon.svg";
function HeadBar() {
  return (
      <Layout.Header className="sgsb-admin-dashboard-module-top-bar" >
         <div >
          <Row
            align="middle"
            justify="espace-betweennd"
          >
            <Col span={24}>
              <Row justify="end">
                <div className="help-btn">
                  <Button
                    width="210px"
                    href="https://invizo.io/support/"
                    target="_blank"
                    type="primary"
                  >
                    Need Help?
                    <Image preview={false} width={22} src={helpIcon} />
                  </Button>
                </div>
              </Row>
            </Col>
          </Row>
        </div>
      </Layout.Header>
  );
}

export default HeadBar;
