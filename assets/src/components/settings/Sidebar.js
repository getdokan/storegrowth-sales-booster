import { useEffect, useState, useSelect } from "@wordpress/element";
import { applyFilters } from "@wordpress/hooks";
import { Layout, Menu, Image } from "antd";
import { Link, matchRoutes, Navigate, useLocation } from "react-router-dom";

import dashboardIcon from "../../../images/dashboard-icon.svg";
import logo from "../../../images/logo.svg";
import downArrowIocn from "../../../images/menu/down-arrow-icon.svg";
import upArrowIocn from "../../../images/menu/up-arrow-icon.svg";
import widgetIcon from "../../../images/widget-icon.svg";

function Sidebar({ routes }) {
  let sidebarItems = applyFilters("sidebar_menu_items", [], Link);
  let firstItem = sidebarItems[0] || false;

  const location = useLocation();

  // Redirect to the first menu if it is the index page.
  if (location.pathname === "/" && firstItem) {
    return <Navigate to={`/${firstItem.key}`} replace={true} />;
  }

  const [activeClass, setActiveClass] = useState(false);
  const [{ route: currentRoute }] = matchRoutes(routes, location);

  const [selectedMenu, setSelectedMenu] = useState(currentRoute?.name);

  const toggleMenuClass = () => {
    setActiveClass((prevIsActive) => !prevIsActive);
  };

  useEffect(() => {
    setSelectedMenu(currentRoute?.name);
  }, [currentRoute?.name]);

  const handleLiClick = (routeName) => {
    setSelectedMenu(routeName);
    const linkElement = document.querySelector(
      `a[data-route-name="${routeName}"]`
    );
    if (linkElement) {
      linkElement.click();
    }
  };

  return (
    <Layout.Sider
      className="site-layout-background sgsb__settings-sidebar"
      style={{
        minHeight: "100vh",
      }}
    >
      <div className="sgsb-admin-setting-dashboard-sideabr">
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
            {routes.map((route) => (
              <li
                key={route.name}
                onClick={() => handleLiClick(route.name)} // Handle the click event on <li>
                className={
                  selectedMenu === route.name
                    ? `sgsb-selected-module ${route.name}`
                    : `${route.name}`
                }
              >
                <Link
                  className={
                    selectedMenu === route.name ? "sgsb-selected-link" : ""
                  }
                  data-route-name={route.name}
                  to={route.path}
                >
                  {route.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Layout.Sider>
  );
}

export default Sidebar;
