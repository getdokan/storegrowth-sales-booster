import { Layout, Alert } from 'antd';
import { useRoutes, Outlet, useNavigate,useParams, useSearchParams } from 'react-router-dom';
import { applyFilters } from '@wordpress/hooks';

import HeaderBar from "../HeaderBar";
import Sidebar from "./Sidebar";
import PageLoader from "../PageLoader";

function ModuleSettings({ routes }) {
  let element = useRoutes(routes);

  return (
    <Layout className="sgsb-layout-relative">
      <Sidebar routes={routes} />

      <Layout>
        <Layout.Content
          style={{
            paddingLeft: 25,
            minHeight: 550,
          }}
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

  let routes = applyFilters( 'sgsb_routes', [], Outlet, navigate, useParams, useSearchParams );

  return (
    <Layout>
      <HeaderBar />

      <h1 className="sgsb-heading" style={ { marginBottom: '15px' } }>Sales Booster Settings</h1>

      {!routes.length ? <NoModuleActive /> : <ModuleSettings routes={routes} />}
    </Layout>
  );
}

export default AppLayout;
