import { applyFilters } from "@wordpress/hooks";
import { Alert, Layout } from "antd";
import {
  Outlet,
  useNavigate,
  useParams,
  useRoutes,
  useSearchParams,
} from "react-router-dom";

import React from "react";
import HeadBar from "./HeadBar";
import Sidebar from "./Sidebar";
import PageLoader from "../PageLoader";
import dashboardRoutes from "../dashboard/DashboardRoutes";

function ModuleSettings({ routes }) {
  let element = useRoutes(routes);
  return (
    <Layout className="sgsb-layout-relative">
      <Sidebar routes={routes} />

      <Layout>
        <HeadBar />
        <Layout.Content
          className="sgsb-module-setting-layout"
        >
          {element}
        </Layout.Content>
      </Layout>
      <PageLoader />
    </Layout>
  );
}

// If not module is active.
function NoModuleActive() {
  return (
    <Alert
      message="You don't have any module active, Please active any module to update settings."
      type="info"
    />
  );
}

function AppLayout() {
  let navigate = useNavigate();

  let routes = applyFilters(
    'sgsb_routes',
    [ ...dashboardRoutes ],
    Outlet,
    navigate,
    useParams,
    useSearchParams
  );

  return (
    <Layout>
      {!routes.length ? <NoModuleActive /> : <ModuleSettings routes={routes} />}
    </Layout>
  );
}

export default AppLayout;
