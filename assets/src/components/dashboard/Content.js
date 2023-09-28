// Content.js
import React from "react";
import { Router ,useLocation} from "react-router-dom";

import NavRouter from "./NavRouter";
import Overview from "./Overview";
import Pricing from "./Pricing";
import Faq from "./Faq";

function Content() {

  const routes = [
    { path: "/overview", label: "Overview", element: <Overview /> },
    { path: "/pricing", label: "Pricing", element: <Pricing /> },
    { path: "/faq", label: "FAQs", element: <Faq /> },
  ];

  return (
    <>
      {/* Use the NavRouter component with class names */}
      <NavRouter
        routes={routes}
        navClass="dashboard"
        ulClass="dashboad-tab"
        liClass="dashboad-tab-singel"
      />
    </>
  );
}

export default Content;
