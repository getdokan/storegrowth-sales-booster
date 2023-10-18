import { React, useState } from "react";
import { Col, Image } from "antd";
import FeatCheck from "../../../images/feature-checked.svg";
import UnCheck from "../../../images/feature-unchecked.svg";
import LoopArrow from "../dashboard/images/gaurantee-arrow.svg";
import GaraunteeBadge from "../../../images/gaurentee-bagde.svg";
import DashboardTabs from "./DashboardTabs";
import Promotion from "./Promotion";
import PanelContainer from "../settings/Panels/PanelContainer";
import PanelRow from "../settings/Panels/PanelRow";
import { __ } from "@wordpress/i18n";
import PricingToggle from "./PricingToggle";
import Gaurantee from "./Gaurantee";

const Pricing = () => {
  const [isYearly, setIsYearly] = useState(true);
  const handleToggle = () => {
    setIsYearly(!isYearly);
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
                    <div className="comparison-section">
                      {/* <div className="sg_pro_offer">
                        <div className="sg_pro_btm">
                          <div className="sg_pro_btm_left">
                            <div className="sg_pro_top">
                              <h3>{ __( 'Comparison With StoreGrowth PRO', 'storegrowth-sales-booster' ) }</h3>
                            </div>
                            <div className="sg_comparison_table">
                              <div className="sg_pro_chart">
                                <h5>
                                  StoreGrowth <span>free</span>
                                </h5>
                                <ul className="sg-feature-list">
                                  <li>
                                    <Image
                                      preview={false}
                                      src={FeatCheck}
                                      alt="chek"
                                    />
                                    Frontend order management
                                  </li>
                                  <li>
                                    <Image
                                      preview={false}
                                      src={FeatCheck}
                                      alt="chek"
                                    />
                                    Frontend order management
                                  </li>
                                  <li>
                                    <Image
                                      preview={false}
                                      src={UnCheck}
                                      alt="chek"
                                    />
                                    Frontend order management
                                  </li>
                                  <li>
                                    <Image
                                      preview={false}
                                      src={UnCheck}
                                      alt="chek"
                                    />
                                    Frontend order management
                                  </li>
                                  <li>
                                    <Image
                                      preview={false}
                                      src={UnCheck}
                                      alt="chek"
                                    />
                                    Frontend order management
                                  </li>
                                  <li>
                                    <Image
                                      preview={false}
                                      src={UnCheck}
                                      alt="chek"
                                    />
                                    Frontend order management
                                  </li>
                                  <li>
                                    <Image
                                      preview={false}
                                      src={UnCheck}
                                      alt="chek"
                                    />
                                    Frontend order management
                                  </li>
                                  <li>
                                    <Image
                                      preview={false}
                                      src={UnCheck}
                                      alt="chek"
                                    />
                                    Frontend order management
                                  </li>
                                 
                                </ul>
                              </div>
                              <div className="sg_pro_chart_2">
                                <h5>
                                  StoreGrowth <span>pro</span>
                                </h5>
                                <ul className="sg-feature-list">
                                  <li>
                                    <Image
                                      src={FeatCheck}
                                      preview={false}
                                      alt="chek"
                                    />
                                    Frontend order management
                                  </li>
                                  <li>
                                    <Image
                                      src={FeatCheck}
                                      preview={false}
                                      alt="chek"
                                    />
                                    Frontend order management
                                  </li>
                                  <li>
                                    <Image
                                      src={FeatCheck}
                                      preview={false}
                                      alt="chek"
                                    />
                                    Frontend order management
                                  </li>
                                  <li>
                                    <Image
                                      src={FeatCheck}
                                      preview={false}
                                      alt="chek"
                                    />
                                    Frontend order management
                                  </li>
                                  <li>
                                    <Image
                                      src={FeatCheck}
                                      preview={false}
                                      alt="chek"
                                    />
                                    Frontend order management
                                  </li>
                                  <li>
                                    <Image
                                      src={FeatCheck}
                                      preview={false}
                                      alt="chek"
                                    />
                                    Frontend order management
                                  </li>
                                  <li>
                                    <Image
                                      src={FeatCheck}
                                      preview={false}
                                      alt="chek"
                                    />
                                    Frontend order management
                                  </li>
                                  <li>
                                    <Image
                                      src={FeatCheck}
                                      preview={false}
                                      alt="chek"
                                    />
                                    Frontend order management
                                  </li>
                                </ul>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div> */}
                      {/* Package Table */}
                      <div className="sg_pricing_table">
                        <div className="sgsb-pricing-heading">
                          <h3>The Package We Provide</h3>
                          <div className="pricing-table-heading-content">
                            <span>
                              Join 100,000+ website owners who use Booster to
                              increase sales, engage visitors and so much more.
                            </span>
                          </div>
                          <PricingToggle
                            isActive={isYearly}
                            handleToggle={handleToggle}
                          />
                          <Image
                            className="gaurantee-badge"
                            src={GaraunteeBadge}
                            preview={false}
                          />
                          <Image
                            className="loop-arrow"
                            src={LoopArrow}
                            preview={false}
                          />
                        </div>

                        <div className="sg_package">
                          <table>
                            <colgroup>
                              {/* <col span="1" className="bg" /> */}
                              <col span="1" className="bg_2" />
                              <col
                                span="1"
                                className="sg-most-popular-package-coloumn"
                              />
                              <col span="1" className="bg_4" />
                            </colgroup>
                            <thead>
                              <tr className="row_1">
                                {/* <th style={{ borderBottom: "none" }}></th> */}
                                <th className="sgsb-pricing-table-header">
                                  <div className="sg_package_rate">
                                    <span className="sg-package-title">
                                      Personal Package
                                    </span>
                                    <a href="#">
                                      <span className="buy-button-normal">
                                        get started
                                      </span>
                                    </a>
                                    {isYearly ? (
                                      <h3 className="yearly-price">
                                        $49 <span>/ year</span>
                                      </h3>
                                    ) : (
                                      <h3 className="lifitime-price">$150</h3>
                                    )}
                                  </div>
                                </th>
                                <th className="sgsb-pricing-table-header-popular">
                                  <div className="sg_package_rate">
                                    <span className="sgsb-popular-packages">
                                      most popular
                                    </span>
                                    <span className="sg-package-title">
                                      Agency Package
                                    </span>
                                    <a href="#">
                                      <span className="buy-button-popular">
                                        get started
                                      </span>
                                    </a>
                                    {isYearly ? (
                                      <h3>
                                        $89 <span>/ year</span>
                                      </h3>
                                    ) : (
                                      <h3>$250</h3>
                                    )}
                                  </div>
                                </th>
                                <th className="sgsb-pricing-table-header">
                                  <div className="sg_package_rate">
                                    <span className="sg-package-title">
                                      Lifetime Package
                                    </span>
                                    <a href="#">
                                      <span className="buy-button-normal">
                                        get started
                                      </span>
                                    </a>
                                    {isYearly ? (
                                      <h3>
                                        $159 <span>/ year</span>
                                      </h3>
                                    ) : (
                                      <h3>$500</h3>
                                    )}
                                  </div>
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr>
                                {/* <td>website</td> */}
                                <td className="site-activation-number">
                                  Activation on 1 Site
                                </td>
                                <td className="site-activation-number">
                                  Activation on 20 Site
                                </td>
                                <td className="site-activation-number">
                                  Activation on 50 Site
                                </td>
                              </tr>
                              <tr>
                                {/* <td>ready demo</td> */}
                                <td>Support & Updates for 1 year</td>
                                <td>Support & Updates for 1 year</td>
                                <td>Support & Updates for 1 year</td>
                              </tr>
                              <tr>
                                {/* <td>domain</td> */}
                                <td>25% Renewal Discount</td>
                                <td>25% Renewal Discount</td>
                                <td>25% Renewal Discount</td>
                              </tr>
                              <tr>
                                {/* <td>color scheme</td> */}
                                <td>Custom Notification</td>
                                <td>Custom Notification</td>
                                <td>Custom Notification</td>
                              </tr>
                              <tr>
                                <td>MailChimp Integrations</td>
                                <td>MailChimp Integrations</td>
                                <td>MailChimp Integrations</td>
                              </tr>
                              <tr>
                                <td>MailChimp Integrations</td>
                                <td>MailChimp Integrations</td>
                                <td>MailChimp Integrations</td>
                              </tr>
                              <tr>
                                <td>MailChimp Integrations</td>
                                <td>MailChimp Integrations</td>
                                <td>MailChimp Integrations</td>
                              </tr>
                              <tr>
                                <td>MailChimp Integrations</td>
                                <td>MailChimp Integrations</td>
                                <td>MailChimp Integrations</td>
                              </tr>
                              <tr>
                                <td>MailChimp Integrations</td>
                                <td>MailChimp Integrations</td>
                                <td>MailChimp Integrations</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
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

export default Pricing;
