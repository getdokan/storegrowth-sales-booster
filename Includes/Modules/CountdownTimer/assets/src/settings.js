import { addFilter } from "@wordpress/hooks";
import SalesCountdownLayout from "./components/SalesCountdownLayout";
import { StockOutlined } from "@ant-design/icons";

/**
 * Add routes to sidebar.
 */
addFilter(
  "sgsb_routes",
  "sgsb",
  (routes, outlet, navigate, useParams, useSearchParams) => {
    const moduleName = "countdown-timer";

    routes.push({
      name: moduleName,
      label: "Countdown Timer",
      path: "/countdown-timer",
      element: (
        <SalesCountdownLayout
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
    label: <Link to="/countdown-timer">Countdown Timer</Link>,
    key: "countdown-timer",
    icon: <StockOutlined />,
  });

  return items;
});
