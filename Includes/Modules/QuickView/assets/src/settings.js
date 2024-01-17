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
    routes.push({
      name: "quick-view",
      label: "Stock Bar",
      path: "/quick-view",
      element: (
        <QuickViewLayout
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
