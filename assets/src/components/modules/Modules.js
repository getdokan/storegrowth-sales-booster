import { useDispatch, useSelect } from "@wordpress/data";
import { useEffect, useState } from "@wordpress/element";
import { Button, Col, Image, Row } from "antd";
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
  const proPluginActivated = spsgAdmin.isPro;
  const { updateModules, setPageLoading } = useDispatch("spsg");
  const [searchModule, setSearchModule] = useState("");
  const [selectFilter, setSelectFilter] = useState({
    modules: [],
  });
  const [filterActiveModules, setFilterActiveModules] = useState(false);
  // handle active module of settings url
  const [activeModule, setActiveModule] = useState(false);
  const [activeModalData, setActiveModalData] = useState("");

  // Get from WP data.
  const { allModules } = useSelect((select) => ({
    allModules: select("spsg").getModules(),
  }));

  // check only tha activated Modules
  const activatedModules = allModules.filter((module) => module.status).length;

  const handlefilterChange = (checked) => {
    setFilterActiveModules(checked);
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
    }).then((response) => {
      if (response.success) {
        const spsgSettingsURL = `admin.php?page=spsg-settings#${module.id}`;
        window.location.href = spsgSettingsURL;
      }
    });
  };

  const handleLiClick = (routeName) => {
    const link = `admin.php?page=spsg-settings#/${routeName}`;
    window.location.href = link;
  };

  useEffect(() => {
    if (allModules) {
      setSelectFilter({ modules: allModules });
    }
  }, [allModules]);

  useEffect(() => {
    setPageLoading(true);
    Ajax("get_all_modules").then((response) => {
      // Update to WP data.
      updateModules(response);
      setPageLoading(false);
    });
  }, []);

  /**
   *
   * Side Effect loading for if deactivated Modules page if the Modules are being deactivate and
   * and set the setFilterActiveModules to false
   *
   */

  useEffect(() => {
    if (activatedModules === 0 && filterActiveModules) {
      setFilterActiveModules(false);
    }
  }, [activatedModules]);

  return (
    <div className="site-card-wrapper spsg-admin-dashboard">
      <div className="spsg-admin-dashboard-sideabr">
        <div className="spsg-logo">
          <Image preview={false} width={164} src={logo} />
        </div>

        <h3 className={`${activeModule === "dashboard" ? "active-menu" : ""}`}>
          <a
            className={activeModule === "dashboard" ? "spsg-selected-link" : ""}
            href={`${
              window.location.origin + window.location.pathname
            }?page=spsg-settings#/dashboard/overview`}
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
      <div className="spsg-admin-dashboard-module">
        <div className="spsg-admin-dashboard-module-top-bar">
          <Row
            className="spsg-search-section"
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
                    href="https://storegrowth.io/contact-us/"
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
        />
      </div>
    </div>
  );
}

export default Modules;
