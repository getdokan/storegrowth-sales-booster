import { Layout } from "antd";
import { Button, Col, Image, Row } from "antd";
import helpIcon from "../../../images/help-icon.svg";
import crownIcon from "../../../images/cap-icon.svg";
function HeadBar() {
  const pricingPath = window.location.hash === '#/dashboard/pricing';

  return (
    <Layout.Header className="sgsb-admin-dashboard-module-top-bar">
      <div>
        <Row align="middle" justify="espace-betweennd">
          <Col span={24}>
            <Row justify="end">
              {(!sgsbAdmin.isPro && !pricingPath) && (
                <div className="premium-btn">
                  <Button
                    width="210px"
                    href="https://storegrowth.io/pricing/"
                    type="primary"
                  >
                    Get Premium
                    <Image preview={false} width={22} src={crownIcon} />
                  </Button>
                </div>
              )}
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
