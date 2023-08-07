import { Layout } from 'antd';

import PageLoader from "../PageLoader";
import Modules from "./Modules";

function AppLayout() {
  return (
    <Layout>

      <Layout
          style={{
            paddingTop: '4px',
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
