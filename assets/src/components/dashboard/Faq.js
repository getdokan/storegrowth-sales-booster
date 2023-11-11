import React from "react";
import { Collapse, Image,Col } from "antd";
import AccorUP from "../../../images/accor-up.svg";
import AccorDown from "../../../images/accor-donw.svg";
import DashboardTabs from "./DashboardTabs";
import Promotion from "./Promotion";
import PanelContainer from "../settings/Panels/PanelContainer";
import PanelRow from "../settings/Panels/PanelRow";
const text = `
  A dog is a type of domesticated animal.
  Known for its loyalty and faithfulness,
  it can be found as a welcome guest in many households across the world.
`;

const getItems = (panelStyle) => [
    {
        key: "1",
        label: "This is panel header 1",
        children: <p>{text}</p>,
        style: panelStyle,
    },
    {
        key: "2",
        label: "This is panel header 2",
        children: <p>{text}</p>,
        style: panelStyle,
    },
    {
        key: "3",
        label: "This is panel header 3",
        children: <p>{text}</p>,
        style: panelStyle,
    },
];

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
                <Col span={18} className={ `dashboard-faq-page` }>
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
                            <Image preview={false} src={isActive ? AccorUP : AccorDown} />
                        )}
                        style={{
                            background: "none",
                        }}
                        items={getItems(panelStyle)}
                    />
                </div>
            </div>
        </div>
                </Col>
                <Col span={6} className={ `dashboard-faq-page` }>
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
