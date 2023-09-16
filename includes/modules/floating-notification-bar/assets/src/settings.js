import { addFilter } from "@wordpress/hooks";
import FreeShippingBarLayout from "./components/FreeShippingBarLayout";
import { InsertRowAboveOutlined } from "@ant-design/icons";

/**
 * Add routes to sidebar.
 */
addFilter(
  "sgsb_routes",
  "sgsb",
  (routes, outlet, navigate, useParams, useSearchParams) => {
    routes.push({
      name: "floating-notification-bar",
      label: "Floating Notification Bar",
      path: "/floating-notification-bar",
      element: (
        <FreeShippingBarLayout
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
    label: <Link to="/floating-notification-bar">Floating Notification Bar</Link>,
    key: "floating-notification-bar",
    icon: <InsertRowAboveOutlined />,
  });

  return items;
});
