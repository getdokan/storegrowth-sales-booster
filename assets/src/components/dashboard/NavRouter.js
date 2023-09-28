import React from "react";
import { Routes, Route, Link,Redirect} from "react-router-dom";
import { Button } from "antd";

function NavRouter({ routes }) {
  return (
    <div className="dashboard">
      <ul className="dashboad-tab">
        {routes.map((route) => (
          <li
            key={route.path}
            className={`dashboad-tab-singel-${route.label.toLowerCase()}`}
          >
            <Link to={route.path}>
              <Button type="link">{route.label}</Button>
            </Link>
          </li>
        ))}
      </ul>
      <Routes>
        {routes.map((route) => (
          <Route key={route.path} path={route.path} element={route.element} />
        ))}
      </Routes>
    </div>
  );
}

export default NavRouter;
