import { Layout } from "antd";
import { useRoutes } from "react-router-dom";

import PageLoader from "../PageLoader";
import moduleRoutes from "./ModuleRoutes";
import { removeHashFromURL } from "../../utils/helper";

function AppLayout() {
  const currentPath = removeHashFromURL(window.location.hash);
  let element = useRoutes(moduleRoutes);

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
          {element}
        </Layout.Content>
      </Layout>
      {currentPath !== "ini-setup" && <PageLoader />}
    </Layout>
  );
}

export default AppLayout;
