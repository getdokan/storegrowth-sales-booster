import { Layout } from "antd";
import { Fragment } from "react";
import PageLoader from "../PageLoader";
import Dashboard from "./Dashboard";

function AppLayout() {
  return (
    <Layout>
      <Layout
        style={{
          padding: "0",
        }}
      >
        <Layout.Content
          style={{
            minHeight: 550,
          }}
        >
          <Fragment>
            <Dashboard />
          </Fragment>
        </Layout.Content>
      </Layout>

      <PageLoader />
    </Layout>
  );
}

export default AppLayout;
