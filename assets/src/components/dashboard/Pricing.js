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

const Pricing = () => {
  const prices = {
    idivisual: 99,
    bussiness: 299,
    developer: 199,
  };
 const toggleContent = {
    leftContent: "Yearly",
    rightContent: "Monthly"
  }
  const purchaseSlug="https://storegrowth.io"
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
                            toggleContent={toggleContent}
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
                                      Individual
                                    </span>
                                    <a href={purchaseSlug} target="_blank">
                                      <span className="buy-button-normal">
                                        get started
                                      </span>
                                    </a>
                                    {isYearly ? (
                                      <h3 className="yearly-price">
                                        ${prices.idivisual} <span>/ year</span>
                                      </h3>
                                    ) : (
                                      <h3 className="monthly-price">${Math.round(prices.idivisual/12)}<span>/ month</span></h3>
                                    )}
                                  </div>
                                </th>
                                <th className="sgsb-pricing-table-header-popular">
                                  <div className="sg_package_rate">
                                    <span className="sgsb-popular-packages">
                                      best value
                                    </span>
                                    <span className="sg-package-title">
                                      Business
                                    </span>
                                    <a href={purchaseSlug} target="_blank">
                                      <span className="buy-button-popular">
                                        get started
                                      </span>
                                    </a>
                                    {isYearly ? (
                                      <h3 className="yearly-price">
                                        ${prices.bussiness} <span>/ year</span>
                                      </h3>
                                    ) : (
                                      <h3 className="monthly-price">${Math.round(prices.bussiness/12)}<span>/ month</span></h3>
                                    )}
                                  </div>
                                </th>
                                <th className="sgsb-pricing-table-header">
                                  <div className="sg_package_rate">
                                    <span className="sg-package-title">
                                      Developer
                                    </span>
                                    <a href={purchaseSlug} target="_blank">
                                      <span className="buy-button-normal">
                                        get started
                                      </span>
                                    </a>
                                    {isYearly ? (
                                      <h3 className="yearly-price">
                                        ${prices.developer} <span>/ month</span>
                                      </h3>
                                    ) : (
                                      <h3 className="monthly-price">${Math.round(prices.developer/12)}<span>/ month</span></h3>
                                    )}
                                  </div>
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr className="pricing-table-data-highlight">
                                {/* <td>website</td> */}
                                <td>1 site Activation</td>
                                <td>50 site Activation</td>
                                <td>5 site Activation</td>
                              </tr>
                              <tr className="pricing-table-data-highlight">
                                <td>25% Renewal Discount</td>
                                <td>25% Renewal Discount</td>
                                <td>25% Renewal Discount</td>
                              </tr>
                              <tr>
                                <td>1 year blazed fast support</td>
                                <td>1 year blazed fast support</td>
                                <td>1 year blazed fast support</td>
                              </tr>
                              <tr className="pricing-table-data-highlight">
                                {/* <td>color scheme</td> */}
                                <td>All Pro Features</td>
                                <td>All Pro Features</td>
                                <td>All Pro Features</td>
                              </tr>
                              <tr>
                                <td>Quick Cart</td>
                                <td>Quick Cart</td>
                                <td>Quick Cart</td>
                              </tr>
                              <tr>
                                <td>Sales Pop </td>
                                <td>Sales Pop </td>
                                <td>Sales Pop </td>
                              </tr>
                              <tr>
                                <td>Upsell Order Bump </td>
                                <td>Upsell Order Bump </td>
                                <td>Upsell Order Bump </td>
                              </tr>
                              <tr>
                                <td>Stock Bar </td>
                                <td>Stock Bar </td>
                                <td>Stock Bar </td>
                              </tr>
                              <tr>
                                <td>Sales Countdown</td>
                                <td>Sales Countdown</td>
                                <td>Sales Countdown</td>
                              </tr>
                              <tr>
                                <td>Floating Bar</td>
                                <td>Floating Bar</td>
                                <td>Floating Bar</td>
                              </tr>
                              <tr>
                                <td>Direct Checkout</td>
                                <td>Direct Checkout</td>
                                <td>Direct Checkout</td>
                              </tr>
                              <tr>
                                <td>Free Shipping Bar</td>
                                <td>Free Shipping Bar</td>
                                <td>Free Shipping Bar</td>
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
