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

  const handlefilterChange = (checked) => {
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
      ? allModules.filter((module) => module.status).length // Count only active modules
      : allModules.length; // Count all modules
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

  // Handle changes in filterActiveModules
  useEffect(() => {
    // Calculate the number of active modules
    const activeModuleCount = allModules.filter(
      (module) => module.status
    ).length;

    if (filterActiveModules) {
      // If filterActiveModules is true, recalculate pagination based on active modules
      const newMaxValue = currentPage * perPageItem;
      const newMinValue = newMaxValue - perPageItem;

      // Update pagination data
      setMaxValue(newMaxValue);
      setMinValue(newMinValue);
      // setCurrentPage(currentPage);

      // If active modules are less than currentPage * perPageItem, reset currentPage
      activeModuleCount <= perPageItem
        ? setCurrentPage(1)
        : setCurrentPage(currentPage);
    } else {
      // If filterActiveModules is false, reset pagination to show the first page
      setCurrentPage(currentPage);

      // Calculate new min and max values based on all modules
      const newMaxValue = currentPage * perPageItem;
      const newMinValue = newMaxValue - perPageItem;

      // Update pagination data
      setMaxValue(newMaxValue);
      setMinValue(newMinValue);
    }
  }, [allModules, filterActiveModules, currentPage, perPageItem]);

  const moduleLength = allModules.filter((module) =>
    filterActiveModules ? module.status : true
  ).length;

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

        <h3>
          <Image preview={false} width={19} src={dashboardIcon} />
          Dashboard
        </h3>
        <div className="all-widgets-menu">
          <h4>
            <Image preview={false} width={18} src={widgetIcon} />
            All Modules
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

        <ModuleFilter onFilterChange={handlefilterChange} />

        <PremiumBox />
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
          {moduleLength > 0 ? (
            <Pagination
              defaultCurrent={1}
              current={currentPage}
              defaultPageSize={perPageItem}
              onChange={hanglePageItem}
              total={totalItems}
              hideOnSinglePage={false}
            />
          ) : (filterActiveModules &&
            <Alert
              message="Error"
              description="There is no available active module"
              type="error"
              showIcon
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default Modules;
