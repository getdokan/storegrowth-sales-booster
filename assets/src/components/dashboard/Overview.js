import React from "react";
import { Image, Col } from "antd";
import { CaretRightFilled } from '@ant-design/icons';
import DocIcon from "../../../images/documentation-icon.svg";
import EmailIcon from "../../../images/email-icon.svg";
import RequestIcon from "../../../images/request-icon.svg";
import DashboardTabs from "./DashboardTabs";
import Promotion from "./Promotion";
import PanelContainer from "../settings/Panels/PanelContainer";
import PanelRow from "../settings/Panels/PanelRow";
import IntroModules from "./images/intro-section-img.svg";
import {__} from "@wordpress/i18n";
import SectionSpacer from "../settings/Panels/PanelSettings/SectionSpacer";
const Overview = () => {
  return (
    <div className="site-card-wrapper sgsb-admin-dashboard">
      <div className="sgsb-admin-dashboard-module">
        <div
          className="sgsb-dasboard-container"
          style={{ padding: "30px 0px 0px 0px" }}
        >
          <PanelContainer>
            <PanelRow>
              <Col span={18} className={ `dashboard-overview-page` }>
                <div className="dashboard">
                  {/* Render dashboard tabs. */}
                  <DashboardTabs />

                  {/* Render dashboard contents. */}
                  <div className="dashboad-content">
                    {/* intro-section */}
                    <div className="intro-section">
                      <div className="intro-section-banner">
                        <div className="intro-section-text">
                          <div className="music-player-background-is-the-background">
                            <div className="music-player-background">
                              <CaretRightFilled className="fa-solid fa-play music-player"/>
                            </div>
                          </div>
                          <h3>
                              { __( 'Your First', 'storegrowth-sales-booster' ) }
                              <br />
                              { __( 'Impression With', 'storegrowth-sales-booster' ) }
                              <br />
                              { __( 'StoreGrowth', 'storegrowth-sales-booster' ) }
                          </h3>
                        </div>

                        <div className="inrto-section-img-backgroud">
                          <Image
                            preview={false}
                            src={IntroModules}
                            alt="intro-img"
                          />
                        </div>
                      </div>
                    </div>

                    {/* info-section */}
                    <div className="info-section">
                      <div className="info-section-containt">
                        {/* documentation-section */}
                        <div className="documentation-section">
                          <div className="documentation-section-containt">
                            <div className="documentation-icon-background doc-icon">
                              <Image
                                preview={false}
                                src={DocIcon}
                                className="documentation-icon"
                                alt="documentation-icon"
                              />
                            </div>

                            <h3>{ __( 'Documentation', 'storegrowth-sales-booster' ) }</h3>
                            <p>
                            Access our comprehensive documentation for easy, step-by-step guidance on using every feature of our plugin. Get answers quickly and make the most of our powerful tools.
                            </p>
                            <a href="#">Read More</a>
                          </div>
                        </div>
                        {/* close-documentation-section */}
                        {/* email-section */}
                        <div className="documentation-section">
                          <div className="documentation-section-containt">
                            <div className="documentation-icon-background email-icon">
                              <Image
                                preview={false}
                                src={EmailIcon}
                                alt="email-icon.svg"
                                className="documentation-icon"
                              />
                            </div>

                            <h3>{ __( 'Email Support', 'storegrowth-sales-booster' ) }</h3>
                            <p>
                            Stuck or have questions? Reach out to our responsive email support. Our team is here to help you with any inquiries or issues you might encounter. We're just an email away!
                            </p>
                            <a href="#">Contact Us</a>
                          </div>
                        </div>
                        {/* close-email-section */}
                      </div>
                    </div>

                    {/* open-request-features */}
                    <div className="request-features">
                      <div className="request-icon-background">
                        <Image preview={false} src={RequestIcon} />
                      </div>

                      <h3>{ __( 'Have Any Thoughts or Feature Request?', 'storegrowth-sales-booster' ) }</h3>
                      <p>
                      Your insights matter! Help us shape the future of our plugin by sharing your feature requests. We're eager to hear your ideas and work together to make our plugin even better. Your feedback is invaluable, and we appreciate your contribution to improving the plugin to meet your needs.
                      </p>
                      <span className="feature-requests-submit-button">
                        <a href="#">Submit Request</a>
                      </span>
                    </div>
                    {/* close-request-features */}
                  </div>
                </div>
              </Col>
              <Col span={6} className={ `dashboard-overview-page` }>
                <Promotion />
              </Col>
            </PanelRow>
          </PanelContainer>
        </div>
      </div>
    </div>
  );
};

export default Overview;
