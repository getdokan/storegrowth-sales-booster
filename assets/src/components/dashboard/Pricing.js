import React from "react";
import { Image, Col } from "antd";
import FeatCheck from "../../../images/feature-checked.svg";
import UnCheck from "../../../images/feature-unchecked.svg";
import DashboardTabs from "./DashboardTabs";
import Promotion from "./Promotion";
import PanelContainer from "../settings/Panels/PanelContainer";
import PanelRow from "../settings/Panels/PanelRow";
import { __ } from "@wordpress/i18n";

const Pricing = () => {
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
                        <div className="sg_pricing_bottom">
                          <h3>The Package We Provide</h3>
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
                                    <h3>
                                      $49 <span>/ year</span>
                                    </h3>
                                  </div>
                                </th>
                                <th className="sgsb-pricing-table-header-popular">
                                  <div className="sg_package_rate">
                                    <span className="sgsb-popular-packages">
                                      most popular packages
                                    </span>
                                    <span className="sg-package-title">
                                      Agency Package
                                    </span>
                                    <a href="#">
                                      <span className="buy-button-popular">
                                        get started
                                      </span>
                                    </a>
                                    <h3>
                                      $89 <span>/ year</span>
                                    </h3>
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
                                    <h3>
                                      $159 <span>/ year</span>
                                    </h3>
                                  </div>
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr>
                                {/* <td>website</td> */}
                                <td>01</td>
                                <td>09</td>
                                <td>03</td>
                              </tr>
                              <tr>
                                {/* <td>ready demo</td> */}
                                <td>05</td>
                                <td>03</td>
                                <td>06</td>
                              </tr>
                              <tr>
                                {/* <td>domain</td> */}
                                <td>08</td>
                                <td>01</td>
                                <td>05</td>
                              </tr>
                              <tr>
                                {/* <td>color scheme</td> */}
                                <td>01</td>
                                <td>05</td>
                                <td>10</td>
                              </tr>
                              <tr>
                                {/* <td>action</td> */}
                                <td>02</td>
                                <td>07</td>
                                <td>03</td>
                              </tr>
                              {/* <tr>
                                <td style={{ borderBottom: "none" }}>
                                  <div className="sg_buy">
                                    <a href="#">
                                      <span className="buy_1">buy now</span>
                                    </a>
                                  </div>
                                </td>
                                <td style={{ borderBottom: "none" }}>
                                  <div className="sg_buy">
                                    <a href="#">
                                      <span className="buy_2">buy now</span>
                                    </a>
                                  </div>
                                </td>
                                <td style={{ borderBottom: "none" }}>
                                  <div className="sg_buy">
                                    <a href="#">
                                      <span className="buy_3">buy now</span>
                                    </a>
                                  </div>
                                </td>
                              </tr> */}
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
