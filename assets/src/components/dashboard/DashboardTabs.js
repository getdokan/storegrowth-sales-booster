import { __ } from "@wordpress/i18n";
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "antd";

const DashboardTabs = () => {
    const location = useLocation();

    const routes = [
        { path: '/dashboard/overview', label: __( 'Overview', 'storegrowth-sales-booster' ) },
        { path: '/dashboard/pricing', label: __( 'Pricing', 'storegrowth-sales-booster' ) },
        { path: '/dashboard/faq', label: __( 'FAQs', 'storegrowth-sales-booster' ) },
    ];

    const activeNavStyle = {
        color      : '#FFF',
        background : '#0875FF',
    };

    return (
        <ul className="dashboad-tab">
            { routes.map( ( route ) => (
                <li
                    key={ route.path }
                    style={ location.pathname === route.path ? activeNavStyle : {} }
                    className={`dashboad-tab-singel-${ route.label.toLowerCase() }`}
                >
                    <Link to={ route.path }>{ route.label }</Link>
                </li>
            ))}
        </ul>
    );
}

export default DashboardTabs;
