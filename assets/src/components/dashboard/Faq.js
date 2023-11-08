import React from "react";
import { __ } from "@wordpress/i18n";
import { Collapse, Image, Col } from "antd";
import AccorUP from "../../../images/accor-up.svg";
import AccorDown from "../../../images/accor-donw.svg";
import DashboardTabs from "./DashboardTabs";
import Promotion from "./Promotion";
import PanelContainer from "../settings/Panels/PanelContainer";
import PanelRow from "../settings/Panels/PanelRow";
import faqItems from "./Data/faqData";

const Faq = () => {
  const panelStyle = {
    marginBottom: 24,
    background: "#ffffff",
    borderRadius: "5px",
    border: "1px solid #DDE6F9",
    padding: "5px",
  };

  return (
    <div className="site-card-wrapper sgsb-admin-dashboard">
      <div className="sgsb-admin-dashboard-module">
        <div
          className="sgsb-dasboard-container"
          style={{ padding: "30px 0px 0px 0px" }}
        >
          <PanelContainer>
            <PanelRow>
              <Col span={18}>
                <div className="dashboard">
                  {/* Render dashboard tabs. */}
                  <DashboardTabs />

                  {/* Render dashboard contents. */}
                  <div className="dashboad-content">
                    <div className="faqs_wrapper">
                      <div className="faqs-heading">
                        <h4>Frequently asked questions</h4>
                      </div>
                      <Collapse
                        bordered={false}
                        expandIconPosition="end"
                        defaultActiveKey={["1"]}
                        expandIcon={({ isActive }) => (
                          <Image
                            className="faq-collapse-icon"
                            preview={false}
                            src={isActive ? AccorUP : AccorDown}
                          />
                        )}
                      >
                        {faqItems.map((item) => (
                          <Collapse.Panel
                            key={item.key}
                            header={__(item.label, "storegrowth-sales-booster")}
                            style={panelStyle}
                          >
                            <p>
                              {__(item.content, "storegrowth-sales-booster")}
                            </p>
                          </Collapse.Panel>
                        ))}
                      </Collapse>
                    </div>
                  </div>
                </div>
              </Col>
              <Col span={6}>
                <Promotion />
              </Col>
            </PanelRow>
          </PanelContainer>
        </div>
      </div>
    </div>
  );
};

export default Faq;
