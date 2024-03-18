import { addFilter } from "@wordpress/hooks";
import { StockOutlined } from "@ant-design/icons";
import QuickViewLayout from "./components/QuickViewLayout";

/**
 * Add routes to sidebar.
 */
addFilter(
  "sgsb_routes",
  "sgsb",
  (routes, outlet, navigate, useParams, useSearchParams) => {
    const moduleName = "quick-view"
    routes.push({
      name: moduleName,
      label: "Quick View",
      path: "/quick-view",
      element: (
        <QuickViewLayout
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
    label: <Link to="/quick-view">Stock Bar</Link>,
    key: "quick-view",
    icon: <StockOutlined />,
  });

  return items;
});
