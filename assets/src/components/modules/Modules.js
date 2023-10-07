import { useDispatch, useSelect } from "@wordpress/data";
import { useEffect, useState, useMemo } from "@wordpress/element";
import { Alert, Button, Col, Image, Pagination, Row } from "antd";
import { nanoid } from "nanoid";

import { Ajax } from "../../ajax";
import ModuleCard from "./ModuleCard";
import ModuleSearch from "./ModuleSearch";

import dashboardIcon from "../../../images/dashboard-icon.svg";
import helpIcon from "../../../images/help-icon.svg";
import logo from "../../../images/logo.svg";
import downArrowIocn from "../../../images/menu/down-arrow-icon.svg";
import upArrowIocn from "../../../images/menu/up-arrow-icon.svg";
import widgetIcon from "../../../images/widget-icon.svg";
import ModuleFilter from "./ModuleFilter";
import PremiumBox from "./PremiumBox";
import { Link } from "react-router-dom";
import { __ } from "@wordpress/i18n";

function Modules() {
  // pagination
  const perPageItem = 6;
  const [minValue, setMinValue] = useState(0);
  const [maxValue, setMaxValue] = useState(perPageItem);

  const { updateModules, setPageLoading } = useDispatch("sgsb");
  const [searchModule, setSearchModule] = useState("");
  const [selectFilter, setSelectFilter] = useState({
    modules: [],
  });
  const [filterActiveModules, setFilterActiveModules] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  // handle active module of settings url
  const [activeModule, setActiveModule] = useState(false);
  const [activeClass, setActiveClass] = useState(false);

  // Get from WP data.
  const { allModules } = useSelect((select) => ({
    allModules: select("sgsb").getModules(),
  }));

  //check the both active and deactivatd module length
  const activeModuleLength = allModules.filter((module) =>
    filterActiveModules ? module.status : true
  ).length;

  // check only tha activated modules
  const activatedModules = allModules.filter((module) => module.status).length;

  const handlefilterChange = (checked) => {
    setCurrentPage(1);
    setMinValue(0);
    setMaxValue(perPageItem);
    setFilterActiveModules(checked);
  };

  const hanglePageItem = (pageNumber) => {
    if (filterActiveModules) {
      // Pagination calculation based on active modules
      const startIndex = (pageNumber - 1) * perPageItem;
      const endIndex = startIndex + perPageItem;

      setMinValue(startIndex);
      setMaxValue(endIndex);
      setCurrentPage(pageNumber);
    } else {
      // Pagination calculation based on all modules (preserves the current page)
      const startIndex = (pageNumber - 1) * perPageItem;
      const endIndex = startIndex + perPageItem;

      setMinValue(startIndex);
      setMaxValue(endIndex);
      setCurrentPage(pageNumber);
    }
  };

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

  const totalItems = useMemo(() => {
    return filterActiveModules
      ? allModules.filter((module) => module.status).length
      : allModules.length;
  }, [filterActiveModules, allModules]);

  useEffect(() => {
    if (allModules) {
      setSelectFilter({ modules: allModules });
    }
  }, [allModules]);

  useEffect(() => {
    setPageLoading(true);
    Ajax("get_all_modules").success((response) => {
      // Update to WP data.
      updateModules(response);
      setPageLoading(false);
    });
  }, []);

  useEffect(() => {
    if (filterActiveModules) {
      // If filterActiveModules is true, recalculate pagination based on active modules
      const newCurrentPage = Math.ceil(activeModuleLength / perPageItem);
      const updatedCurrentPage =
        currentPage > newCurrentPage ? currentPage - 1 : currentPage;
      const newMaxValue = updatedCurrentPage * perPageItem;
      const newMinValue = newMaxValue - perPageItem;

      // Update pagination data
      setMaxValue(newMaxValue);
      setMinValue(newMinValue);
      setCurrentPage(updatedCurrentPage);
    }
  }, [allModules, perPageItem]);

  /**
   *
   * Side Effect loading for if deactivated modules page if the modules are being deactivate and
   * and set the setFilterActiveModules to false
   *
   */

  useEffect(() => {
    if (activatedModules === 0) {
      setCurrentPage(1);
      setMinValue(0);
      setMaxValue(perPageItem);
      setFilterActiveModules(false);
    }
  }, [activatedModules]);

  // Module List
  const ModuleList = ({ modules }) => {
    return (
      <>
        {modules
          .filter((module) => module.name.toLowerCase().includes(searchModule))
          .filter((module) => (filterActiveModules ? module.status : true)) // Filter based on the filterActiveModules state
          .slice(minValue, maxValue)
          .map((module) => (
            <ModuleCard module={module} key={nanoid()} />
          ))}
      </>
    );
  };

  return (
    <div className="site-card-wrapper sgsb-admin-dashboard">
      <div className="sgsb-admin-dashboard-sideabr">
        <div className="sgsb-logo">
          <Image preview={false} width={164} src={logo} />
        </div>

        <h3 className={`${activeModule === "dashboard" ? "active-menu" : ""}`}>
          <a
            className={activeModule === "dashboard" ? "sgsb-selected-link" : ""}
            href={`${
              window.location.origin + window.location.pathname
            }?page=sgsb-settings#/dashboard/overview`}
          >
            {/*<Image preview={ false } width={ 19 } src={ dashboardIcon } />*/}
            <svg width="19" height="19" viewBox="0 0 19 19" fill="none">
              <rect
                width="8"
                height="8"
                rx="2"
                fill={activeModule === "dashboard" ? "#0875FF" : "#073B4C"}
              />
              <rect
                x="11"
                width="8"
                height="8"
                rx="4"
                fill={activeModule === "dashboard" ? "#0875FF" : "#073B4C"}
              />
              <rect
                y="11"
                width="8"
                height="8"
                rx="2"
                fill={activeModule === "dashboard" ? "#0875FF" : "#073B4C"}
              />
              <rect
                x="11"
                y="11"
                width="8"
                height="8"
                rx="2"
                fill={activeModule === "dashboard" ? "#0875FF" : "#073B4C"}
              />
            </svg>

            {__("Dashboard", "storegrowth-sales-booster")}
          </a>
        </h3>
        {activatedModules > 0 ? (
          <ModuleFilter onFilterChange={handlefilterChange} />
        ) : (
          ""
        )}
        <div className="all-widgets-menu">
          <h4 onClick={toggleMenuClass}>
            <Image preview={false} width={18} src={widgetIcon} />
            All Modules
            <span className="ant-menu-title-content">
              {activeClass ? (
                <img src={downArrowIocn} width="12" />
              ) : (
                <img src={upArrowIocn} width="12" />
              )}
            </span>
          </h4>
          <ul
            className={
              activeClass ? "widgets-menu " : "widgets-menu ant-menu-hidden"
            }
          >
            {allModules.map((module) => {
              return !module.status ? (
                !filterActiveModules && (
                  <li
                    className={module.id}
                    key={module.id}
                    onClick={handleActiveModule}
                  >
                    {module.name}
                  </li>
                )
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

        {!sgsbAdmin.isPro && <PremiumBox />}
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
                <ModuleSearch
                  onChange={(e) => setSearchModule(e.target.value)}
                />
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

        <Row className="sgsb-admin-dashboard-module-box-content">
          <ModuleList modules={selectFilter.modules} />
        </Row>

        <div
          className="sgsb__module-pagination"
          style={{
            paddingTop: "80px",
            paddingLeft: "22px",
          }}
        >
          <Pagination
            defaultCurrent={1}
            current={currentPage}
            defaultPageSize={perPageItem}
            onChange={hanglePageItem}
            total={totalItems}
            hideOnSinglePage={false}
          />
        </div>
      </div>
    </div>
  );
}

export default Modules;
