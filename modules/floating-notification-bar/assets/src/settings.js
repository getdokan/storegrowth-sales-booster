import { addFilter } from "@wordpress/hooks";
import FloatingNotificationBarLayout from "./components/FloatingNotificationBarLayout";
import { InsertRowAboveOutlined } from "@ant-design/icons";

/**
 * Add routes to sidebar.
 */
addFilter(
  "sgsb_routes",
  "sgsb",
  (routes, outlet, navigate, useParams, useSearchParams) => {
    const moduleName = "floating-notification-bar";
    routes.push({
      name: moduleName,
      label: "Floating Bar",
      path: "/floating-notification-bar",
      element: (
        <FloatingNotificationBarLayout
          moduleId = {moduleName}
          outlet={outlet}
          navigate={navigate}
          useParams={useParams}
          useSearchParams={useSearchParams}
        />
      ),
    });

    return routes;
  }
);

/**
 * Add sidebar menu items
 */
addFilter("sidebar_menu_items", "sgsb", (items, Link) => {
  items.push({
    label: (
      <Link to="/floating-notification-bar">Floating Bar</Link>
    ),
    key: "floating-notification-bar",
    icon: <InsertRowAboveOutlined />,
  });

  return items;
});
