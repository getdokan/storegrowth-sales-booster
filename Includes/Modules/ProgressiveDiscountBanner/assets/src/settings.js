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
    const moduleName = "progressive-discount-banner";

    routes.push({
      name: moduleName,
      label: "Free Shipping Rules",
      path: "/progressive-discount-banner",
      element: (
        <FreeShippingBarLayout
          moduleId={moduleName}
          outlet={outlet}
          navigate={navigate}
          useParams={useParams}
          useSearchParams={useSearchParams}
        />
      ),
    });

    return routes;
  },
);

/**
 * Add sidebar menu items
 */
addFilter("sidebar_menu_items", "sgsb", (items, Link) => {
  items.push({
    label: <Link to="/progressive-discount-banner">Discount Banner</Link>,
    key: "progressive-discount-banner",
    icon: <InsertRowAboveOutlined />,
  });

  return items;
});
