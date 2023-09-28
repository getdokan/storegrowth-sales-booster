import { useDispatch, useSelect } from "@wordpress/data";
import { useEffect, useState } from "@wordpress/element";
import { Alert, Button, Col, Image, Row } from "antd";
import { useLocation, Navigate } from "react-router-dom";
import { Ajax } from "../../ajax";

import dashboardIcon from "../../../images/dashboard-icon.svg";
import helpIcon from "../../../images/help-icon.svg";
import logo from "../../../images/logo.svg";
import downArrowIocn from "../../../images/menu/down-arrow-icon.svg";
import upArrowIocn from "../../../images/menu/up-arrow-icon.svg";
import widgetIcon from "../../../images/widget-icon.svg";
import Content from "./Content";
import PanelContainer from "../settings/Panels/PanelContainer";
import PanelRow from "../settings/Panels/PanelRow";
import Promotion from "./Promotion";

function Dashboard() {
  const location = useLocation();
  

  const { updateModules, setPageLoading } = useDispatch("sgsb");
  // handle active module of settings url
  const [activeModule, setActiveModule] = useState(false);
  const [activeClass, setActiveClass] = useState(false);

  // Get from WP data.
  const { allModules } = useSelect((select) => ({
    allModules: select("sgsb").getModules(),
  }));

  const handleActiveModule = () => {
    setActiveModule(true);
    setTimeout(() => {
      setActiveModule(false);
    }, 4000);
  };

  // handle active class
  const toggleMenuClass = () => {
    setActiveClass((prevIsActive) => !prevIsActive);
  };

  useEffect(() => {
    setPageLoading(true);
    Ajax("get_all_modules").success((response) => {
      // Update to WP data.
      updateModules(response);
      setPageLoading(false);
    });
  }, []);

  if (location.pathname === "/") {
    return <Navigate to={`/overview`} replace={true} />;
  }
  
  return (
    <div className="site-card-wrapper sgsb-admin-dashboard">
      <div className="sgsb-admin-dashboard-sideabr">
        <div className="sgsb-logo">
          <Image preview={false} width={164} src={logo} />
        </div>

        <h3>
          <Image preview={false} width={19} src={dashboardIcon} />
          Dashboard
        </h3>
        <div className="all-widgets-menu">
          <h4>
            <Image preview={false} width={18} src={widgetIcon} />
            All Dashboard
            <span onClick={toggleMenuClass} className="ant-menu-title-content">
              {activeClass ? (
                <img src={upArrowIocn} width="12" />
              ) : (
                <img src={downArrowIocn} width="12" />
              )}
            </span>
          </h4>
          <ul
            className={
              activeClass ? "widgets-menu ant-menu-hidden" : "widgets-menu"
            }
          >
            {allModules.map((module) => {
              return !module.status ? (
                <li
                  className={module.id}
                  key={module.id}
                  onClick={handleActiveModule}
                >
                  {module.name}
                </li>
              ) : (
                <li className={module.id} key={module.id}>
                  <a href={`admin.php?page=sgsb-settings#/${module.id} `}>
                    {module.name}
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
      <div className="sgsb-admin-dashboard-module">
        <div className="sgsb-admin-dashboard-module-top-bar">
          <Row
            className="sgsb-search-section"
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
        {activeModule && (
          <Alert
            description="This module is not active. Please active first to view settings"
            type="warning"
            showIcon
            closable
          />
        )}

        {/* <Row className="sgsb-admin-dashboard-module-box-content"> */}
        {/* This is the Dashboad content part */}
        {/* <PanelHeader
              title={__("Sales Countdown Setting", "storegrowth-sales-booster")}
            /> */}
        <div
          className="sgsb-dasboard-container"
          style={{ padding: "40px 0px 0px 40px" }}
        >
          <PanelContainer>
            <PanelRow>
              <Col span={16}>
                <Content />
              </Col>
              <Col span={8}>
                <Promotion />
              </Col>
            </PanelRow>
          </PanelContainer>
        </div>
        {/* </Row> */}
      </div>
    </div>
  );
}

export default Dashboard;
