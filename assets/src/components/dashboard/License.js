import React from "react";
import { LockFilled } from "@ant-design/icons";
import Search from "antd/es/input/Search";
import DashboardTabs from "./DashboardTabs";
import PanelContainer from "../settings/Panels/PanelContainer";
import { __ } from "@wordpress/i18n";

const License = () => {
  return (
    <div className="site-card-wrapper sgsb-admin-dashboard">
      <div className="sgsb-admin-dashboard-module">
        <div
          className="sgsb-dasboard-container"
          style={{ padding: "30px 0px 0px 0px" }}
        >
          <PanelContainer>
            <div>
              <div className={`dashboard-overview-page`}>
                <div className="dashboard">
                  {/* Render dashboard tabs. */}
                  <DashboardTabs />

                  {/* Render dashboard contents. */}
                  <div className="dashboad-content">
                    <div className="license-container">
                      <div className="license-content-container">
                        <div className="license-content-body">
                          <div className="license-icon deactivated">
                            <LockFilled className="lock-deactivated"/>
                          </div>
                          <div className="license-content">
                            <div className="license-heading">
                              <h3>Unlock With Your License Key</h3>
                            </div>
                            <div className="license-description">
                              <p>
                                Enter your license key in the input field below
                                to activate <b>StoreGrowth-Sales Booster </b> to
                                unlock all the premium features.
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="license-key-instruction">
                          <a href="#/dashboard/license">
                            How to get License Key?
                          </a>
                        </div>
                      </div>
                      <div className="license-key-input-form deactivated">
                        <Search
                          className="license-input"
                          placeholder="Enter Your license key"
                          enterButton="Activate"
                          size="large"
                          loading={false}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </PanelContainer>
        </div>
      </div>
    </div>
  );
};

export default License;
