import { useEffect, useState } from "@wordpress/element";
import { Layout, Image } from "antd";
import { Link, matchRoutes, Navigate, useLocation } from "react-router-dom";

import logo from "../../../images/logo.svg";
import downArrowIocn from "../../../images/menu/down-arrow-icon.svg";
import upArrowIocn from "../../../images/menu/up-arrow-icon.svg";
import widgetIcon from "../../../images/widget-icon.svg";
import { __ } from "@wordpress/i18n";
import ActivationAlert from "../modules/ActivationAlert";
import { Ajax } from "../../ajax";

function Sidebar({ routes }) {
    const filteredRoute = routes.filter((item) => item.name !== "dashboard");
    let firstItem = filteredRoute[0] || false;

    const location = useLocation();
    const [activeClass, setActiveClass] = useState(false);
    const matchResult = matchRoutes(routes, location);
    const currentRoute = matchResult ? matchResult[0].route : null;

    const [selectedMenu, setSelectedMenu] = useState(currentRoute?.name);
    const [allRoutes, setAllRoutes] = useState(routes);

    const [activeModule, setActiveModule] = useState(false);
    const [activeModalData, setActiveModalData] = useState("");
    const [modalButtonLoad, setModalButtonLoad] = useState(false);

    const handleModalAlert = (module) => {
        setActiveModule(!activeModule);
        setActiveModalData(module);
    };

    const handleModuleActivation = (module) => {
        setModalButtonLoad(!modalButtonLoad);
        Ajax("update_module_status", {
            module_id: module.name,
            status: true,
        }).success((response) => {
            if (response.success) {
                // Set active routes for settings panel.
                setAllRoutes([...allRoutes?.filter(route => route?.name === module?.name || route?.status !== false)]);
                const sgsbSettingsURL = `admin.php?page=sgsb-settings#/${module.name}`;
                window.location.href = sgsbSettingsURL;
                window.location.reload();
            }
        });
    };

    useEffect(() => {
        Ajax("get_all_modules").success((response) => {
            const dashboardRoutes = [];
            const availableRoutes = allRoutes.map(availableRoute => availableRoute?.name);
            response?.map(route => {
                if ( !availableRoutes?.includes(route?.id) ) {
                    dashboardRoutes.push({
                        name: route?.id,
                        path: `/${route?.id}`,
                        label: route?.name,
                        status: route?.status,
                    });
                }
            });

            setAllRoutes([...allRoutes, ...dashboardRoutes]);
        });
    }, [currentRoute?.name]);
    
    const toggleMenuClass = () => {
        setActiveClass((prevIsActive) => !prevIsActive);
    };

    const dashboardRedirect = () => {
        window.location.href = 'admin.php?page=sgsb-modules';
    };

    useEffect(() => {
        setSelectedMenu(currentRoute?.name);
    }, [currentRoute?.name]);

    const handleLiClick = (routeName) => {
        // Set active routes for settings panel.
        setAllRoutes([...allRoutes?.filter(route => route?.status !== false)]);
        setSelectedMenu(routeName);
        const $ = jQuery,
            linkElement = $(`a[data-route-name='${routeName}']`);

        if (linkElement) {
            const menuRoot = $('#toplevel_page_sales-booster-for-woocommerce');

            // Set dashboard menu deactivate & settings menu active.
            $('ul.wp-submenu li', menuRoot).removeClass('current');
            menuRoot.find(`li:last-child`).addClass('current');

            linkElement.click();
        }
    };
    // Redirect to the first menu if it is the index page.
    if (location.pathname === "/" && filteredRoute.length !== 0) {
        return <Navigate to={`${firstItem.path}`} replace={true} />;
    }
    else if (location.pathname === "/" && filteredRoute.length === 0) {
        window.location.href = "admin.php?page=sgsb-modules";
    }

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

                <h3 className={`${selectedMenu === "dashboard" ? "active-menu" : ""}`}>
                    <Link
                        to={`/dashboard/overview`}
                        data-route-name={`dashboard`}
                        className={selectedMenu === "dashboard" ? "sgsb-selected-link" : ""}
                    >
                        {/*<Image preview={ false } width={ 19 } src={ dashboardIcon } />*/}
                        <svg width="19" height="19" viewBox="0 0 19 19" fill="none">
                            <rect
                                width="8"
                                height="8"
                                rx="2"
                                fill={selectedMenu === "dashboard" ? "#0875FF" : "#073B4C"}
                            />
                            <rect
                                x="11"
                                width="8"
                                height="8"
                                rx="4"
                                fill={selectedMenu === "dashboard" ? "#0875FF" : "#073B4C"}
                            />
                            <rect
                                y="11"
                                width="8"
                                height="8"
                                rx="2"
                                fill={selectedMenu === "dashboard" ? "#0875FF" : "#073B4C"}
                            />
                            <rect
                                x="11"
                                y="11"
                                width="8"
                                height="8"
                                rx="2"
                                fill={selectedMenu === "dashboard" ? "#0875FF" : "#073B4C"}
                            />
                        </svg>

                        {__("Dashboard", "storegrowth-sales-booster")}
                    </Link>
                </h3>
                <div className="all-widgets-menu">
                    <h4
                        onClick={dashboardRedirect}
                    >
                        <Image preview={false} width={18} src={widgetIcon} />
                        {__("All Modules", "storegrowth-sales-booster")}
                    </h4>
                    <ul
                        className={
                            "widgets-menu"
                        }
                    >
                        {allRoutes.map(
                            (route) =>
                                route?.name !== "dashboard" && (
                                    <Link
                                        key={route.name}
                                        className={
                                            selectedMenu === route.name ? "sgsb-selected-link" : ""
                                        }
                                        data-route-name={route.name}
                                        to={route?.status !== false ? route.path : '#'}
                                    >
                                        <li

                                            onClick={() => route?.status === false ? handleModalAlert(route) : handleLiClick(route.name)} // Handle the click event on <li>
                                            className={
                                                selectedMenu === route.name
                                                    ? `sgsb-selected-module ${route.name}`
                                                    : `${route.name}`
                                            }
                                        >
                                            {route.label}
                                        </li>
                                    </Link>
                                )
                        )}
                    </ul>
                </div>
                {activeModule && (
                    <ActivationAlert
                        isDashboard={true}
                        activeModule={activeModule}
                        activeModalData={activeModalData}
                        modalButtonLoad={modalButtonLoad}
                        handleModalAlert={handleModalAlert}
                        handleModuleActivation={handleModuleActivation}
                    />
                )}
            </div>
        </Layout.Sider>
    );
}

export default Sidebar;
