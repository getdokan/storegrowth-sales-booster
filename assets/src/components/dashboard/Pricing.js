import React from "react";
import { Image } from "antd";
import FeatCheck from "../../../images/feature-checked.svg";
import UnCheck from "../../../images/feature-unchecked.svg";
import DashboardTabs from "./DashboardTabs";

const Pricing = () => {
    return (
        <div className="dashboard">
            {/* Render dashboard tabs. */}
            <DashboardTabs />

            {/* Render dashboard contents. */}
            <div className="dashboad-content">
                <div className="comparison-section">
                    <div className="sg_pro_offer">
                        <div className="sg_pro_btm">
                            <div className="sg_pro_btm_left">
                                <div className="sg_pro_top">
                                    <h2>Comparison With StoreGrowth PRO</h2>
                                </div>
                                <div className="sg_comparison_table">
                                    <div className="sg_pro_chart">
                                        <h5>
                                            StoreGrowth <span>free</span>
                                        </h5>
                                        <ul>
                                            <li>
                                                <Image preview={false} src={FeatCheck} alt="chek" />
                                                Frontend order management
                                            </li>
                                            <li>
                                                <Image preview={false} src={FeatCheck} alt="chek" />
                                                Frontend order management
                                            </li>
                                            <li>
                                                <Image preview={false} src={UnCheck} alt="chek" />
                                                Frontend order management
                                            </li>
                                            <li>
                                                <Image preview={false} src={UnCheck} alt="chek" />
                                                Frontend order management
                                            </li>
                                            <li>
                                                <Image preview={false} src={UnCheck} alt="chek" />
                                                Frontend order management
                                            </li>
                                            <li>
                                                <Image preview={false} src={UnCheck} alt="chek" />
                                                Frontend order management
                                            </li>
                                            <li>
                                                <Image preview={false} src={UnCheck} alt="chek" />
                                                Frontend order management
                                            </li>
                                            <li>
                                                <Image preview={false} src={UnCheck} alt="chek" />
                                                Frontend order management
                                            </li>
                                            {/* Add more list items as needed */}
                                        </ul>
                                    </div>
                                    <div className="sg_pro_chart_2">
                                        <h5>
                                            StoreGrowth <span>pro</span>
                                        </h5>
                                        <ul>
                                            <li>
                                                <Image src={FeatCheck} preview={false} alt="chek" />
                                                Frontend order management
                                            </li>
                                            <li>
                                                <Image src={FeatCheck} preview={false} alt="chek" />
                                                Frontend order management
                                            </li>
                                            <li>
                                                <Image src={FeatCheck} preview={false} alt="chek" />
                                                Frontend order management
                                            </li>
                                            <li>
                                                <Image src={FeatCheck} preview={false} alt="chek" />
                                                Frontend order management
                                            </li>
                                            <li>
                                                <Image src={FeatCheck} preview={false} alt="chek" />
                                                Frontend order management
                                            </li>
                                            <li>
                                                <Image src={FeatCheck} preview={false} alt="chek" />
                                                Frontend order management
                                            </li>
                                            <li>
                                                <Image src={FeatCheck} preview={false} alt="chek" />
                                                Frontend order management
                                            </li>
                                            <li>
                                                <Image src={FeatCheck} preview={false} alt="chek" />
                                                Frontend order management
                                            </li>
                                            {/* Add more list items as needed */}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Package Table */}
                    <div className="sg_pricing_table">
                        <div className="sg_pricing_bottom">
                            <h3>The Package We Provide</h3>
                            <a href="#">
                                <span>most popular</span>
                            </a>
                        </div>
                        <div className="sg_package">
                            <table>
                                <colgroup>
                                    <col span="1" className="bg" />
                                    <col span="1" className="bg_2" />
                                    <col span="1" className="bg_3" />
                                    <col span="1" className="bg_4" />
                                </colgroup>
                                <thead>
                                <tr className="row_1">
                                    <th style={{ borderBottom: "none" }}></th>
                                    <th style={{ borderBottom: "none" }}>
                                        <div className="sg_package_rate">
                                            <h3>
                                                $49 <span>/ year</span>
                                            </h3>
                                            <a href="#">
                                                <span className="span">starter</span>
                                            </a>
                                        </div>
                                    </th>
                                    <th style={{ borderBottom: "none" }}>
                                        <div className="sg_package_rate">
                                            <h3>
                                                $89 <span>/ year</span>
                                            </h3>
                                            <a href="#">
                                                <span className="span_2">professional</span>
                                            </a>
                                        </div>
                                    </th>
                                    <th style={{ borderBottom: "none" }}>
                                        <div className="sg_package_rate">
                                            <h3>
                                                $159 <span>/ year</span>
                                            </h3>
                                            <a href="#">
                                                <span className="span_3">business</span>
                                            </a>
                                        </div>
                                    </th>
                                </tr>
                                </thead>
                                <tbody>
                                <tr>
                                    <td>website</td>
                                    <td>01</td>
                                    <td>09</td>
                                    <td>03</td>
                                </tr>
                                <tr>
                                    <td>ready demo</td>
                                    <td>05</td>
                                    <td>03</td>
                                    <td>06</td>
                                </tr>
                                <tr>
                                    <td>domain</td>
                                    <td>08</td>
                                    <td>01</td>
                                    <td>05</td>
                                </tr>
                                <tr>
                                    <td>color scheme</td>
                                    <td>01</td>
                                    <td>05</td>
                                    <td>10</td>
                                </tr>
                                <tr>
                                    <td>action</td>
                                    <td>02</td>
                                    <td>07</td>
                                    <td>03</td>
                                </tr>
                                <tr>
                                    <td style={{ borderBottom: "none" }}></td>
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
                                </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Pricing;
