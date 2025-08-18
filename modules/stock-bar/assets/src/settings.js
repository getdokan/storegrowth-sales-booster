import { addFilter } from "@wordpress/hooks";
import { StockOutlined } from "@ant-design/icons";
import StockBarLayout from "./components/StockBarLayout";

/**
 * Add routes to sidebar.
 */
addFilter(
  "sgsb_routes",
  "sgsb",
  (routes, outlet, navigate, useParams, useSearchParams) => {
    const moduleName = "stock-bar"
    routes.push({
      name: moduleName,
      label: "Stock Bar",
      path: "/stock-bar",
      element: (
        <StockBarLayout
          moduleId={moduleName}
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
    label: <Link to="/stock-bar">Stock Bar</Link>,
    key: "stock-bar",
    icon: <StockOutlined />,
  });

  return items;
});
