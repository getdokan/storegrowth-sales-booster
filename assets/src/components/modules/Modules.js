import { useDispatch, useSelect } from "@wordpress/data";
import { useEffect, useState, useMemo } from "@wordpress/element";
import { Button, Col, Image, Pagination, Row } from "antd";
import ModuleList from "./ModuleList";
import { Ajax } from "../../ajax";
import ModuleSearch from "./ModuleSearch";

import helpIcon from "../../../images/help-icon.svg";
import logo from "../../../images/logo.svg";
import widgetIcon from "../../../images/widget-icon.svg";
import ModuleFilter from "./ModuleFilter";
import PremiumBox from "./PremiumBox";
import { __ } from "@wordpress/i18n";
import ActivationAlert from "./ActivationAlert";

function Modules() {
  // pagination
  const proPluginActivated = sgsbAdmin.isPro;
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
  const [activeClass, setActiveClass] = useState(proPluginActivated);
  const [activeModalData, setActiveModalData] = useState("");

  // Get from WP data.
  const { allModules } = useSelect((select) => ({
    allModules: select("sgsb").getModules(),
  }));

  //check the both active and deactivatd module length
  const activeModuleLength = allModules.filter((module) =>
    filterActiveModules ? module.status : true
  ).length;

  // check only tha activated Modules
  const activatedModules = allModules.filter((module) => module.status).length;

  const handlefilterChange = (checked) => {
    setCurrentPage(1);
    setMinValue(0);
    setMaxValue(perPageItem);
    setFilterActiveModules(checked);
  };

  const hanglePageItem = (pageNumber) => {
    if (filterActiveModules) {
      // Pagination calculation based on active Modules
      const startIndex = (pageNumber - 1) * perPageItem;
      const endIndex = startIndex + perPageItem;

      setMinValue(startIndex);
      setMaxValue(endIndex);
      setCurrentPage(pageNumber);
    } else {
      // Pagination calculation based on all Modules (preserves the current page)
      const startIndex = (pageNumber - 1) * perPageItem;
      const endIndex = startIndex + perPageItem;

      setMinValue(startIndex);
      setMaxValue(endIndex);
      setCurrentPage(pageNumber);
    }
  };

  //Modal alert handler
  const [modalButtonLoad, setModalButtonLoad] = useState(false);
  const handleModalAlert = (module) => {
    setActiveModule(!activeModule);
    setActiveModalData(module);
  };

  const handleModuleActivation = (module) => {
    setModalButtonLoad(!modalButtonLoad);
    Ajax("update_module_status", {
      module_id: module.id,
      status: true,
    }).success((response) => {
      if (response.success) {
        const sgsbSettingsURL = `admin.php?page=sgsb-settings#${module.id}`;
        window.location.href = sgsbSettingsURL;
      }
    });
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

  const handleLiClick = (routeName) => {
    const link = `admin.php?page=sgsb-settings#/${routeName}`;
    window.location.href = link;
  };

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
      // If filterActiveModules is true, recalculate pagination based on active Modules
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
   * Side Effect loading for if deactivated Modules page if the Modules are being deactivate and
   * and set the setFilterActiveModules to false
   *
   */

  useEffect(() => {
    if (activatedModules === 0 && filterActiveModules) {
      setCurrentPage(1);
      setMinValue(0);
      setMaxValue(perPageItem);
      setFilterActiveModules(false);
    }
  }, [activatedModules]);

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
          <h4 className="active-menu">
            <Image preview={false} width={18} src={widgetIcon} />
            All Modules
          </h4>
          <ul className={"widgets-menu"}>
            {allModules.map((module) => {
              return !module.status ? (
                <li
                  className={module.id}
                  key={module.id}
                  onClick={() => handleModalAlert(module)}
                >
                  {module.name}
                </li>
              ) : (
                <li
                  className={module.id}
                  key={module.id}
                  onClick={() => handleLiClick(module.id)}
                >
                  {module.name}
                </li>
              );
            })}
          </ul>
        </div>

        {!proPluginActivated && <PremiumBox />}
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
          <ActivationAlert
            activeModule={activeModule}
            activeModalData={activeModalData}
            modalButtonLoad={modalButtonLoad}
            handleModalAlert={handleModalAlert}
            handleModuleActivation={handleModuleActivation}
          />
        )}
        <ModuleList
          modules={selectFilter.modules}
          filterActiveModules={filterActiveModules}
          searchModule={searchModule}
          minValue={minValue}
          maxValue={maxValue}
        />
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
