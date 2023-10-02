// Content.js
import React from 'react';
import NavRouter from './NavRouter';
import dashboardRoutes from "./DashboardRoutes";

function Content() {
  return (
    <>
      {/* Use the NavRouter component with class names */}
      <NavRouter
        routes={ dashboardRoutes }
        navClass='dashboard'
        ulClass='dashboad-tab'
        liClass='dashboad-tab-singel'
      />
    </>
  );
}

export default Content;
