import { Layout } from 'antd';

import HeaderBar from "../HeaderBar";
import Modules from "./Modules";
import PageLoader from "../PageLoader";

function AppLayout() {
  return (
    <Layout>
      <HeaderBar />

      <h1 className="sgsb-heading">Sales Booster for WooCommerce</h1>

      <Layout
          style={{
            paddingTop: '20px',
          }}
        >
        <Layout.Content
          style={{
            minHeight: 550,
          }}
        >
          <Modules />
        </Layout.Content>
      </Layout>

      <PageLoader />
    </Layout>
  );
}

export default AppLayout;
