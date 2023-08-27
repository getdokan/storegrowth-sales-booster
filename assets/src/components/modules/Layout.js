import { Layout } from 'antd';

import PageLoader from "../PageLoader";
import Modules from "./Modules";

function AppLayout() {
  return (
    <Layout>

      <Layout
          style={{
            padding: '0',
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
