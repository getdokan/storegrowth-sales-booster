import { __ } from "@wordpress/i18n";
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { applyFilters } from "@wordpress/hooks";

const DashboardTabs = () => {
    const location = useLocation();
    let routes = [
        { path: '/dashboard/overview', label: __( 'Overview', 'storegrowth-sales-booster' ) },
        { path: '/dashboard/faq', label: __( 'FAQs', 'storegrowth-sales-booster' ) },
    ];

    routes = applyFilters( "sgsb_dashboard_routes", routes );

    const activeNavStyle = {
        color      : '#FFF',
        background : '#0875FF',
    };

    return (
        <ul className="dashboad-tab">
            { routes && routes?.map( ( route ) => (
                <li
                    key={ route.path } 
                    className={`dashboad-tab-singel-${ route.label.toLowerCase() }`}
                >
                    <Link  style={ location.pathname === route.path ? activeNavStyle : {} } to={ route.path }>{ route.label }</Link>
                </li>
            ))}
        </ul>
    );
}

window.SgsbDashboardTabs = DashboardTabs;

export default DashboardTabs;
