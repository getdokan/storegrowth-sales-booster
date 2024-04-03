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
        <Layout.Content className="sgsb-module-setting-layout">
          {element}
        </Layout.Content>
      </Layout>
      <PageLoader />
    </Layout>
  );
}

// If no module is active.
function NoModuleActive() {
  return (
    <Alert
      message="You don't have any module active. Please activate any module to update settings."
      type="info"
    />
  );
}

function AppLayout() {
  let navigate = useNavigate();

  let routes = applyFilters(
    "sgsb_routes",
    [...dashboardRoutes],
    Outlet,
    navigate,
    useParams,
    useSearchParams
  );

  // routes = !sgsbAdmin.isPro
  //   ? routes
  //   : routes.filter((route) => route.promptEnable !== true);

  return (
    <Layout>
      {!routes.length ? <NoModuleActive /> : <ModuleSettings routes={routes} />}
    </Layout>
  );
}

export default AppLayout;
