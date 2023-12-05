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
      name: "progressive-discount-banner",
      label: "Free Shipping Bar",
      path: "/progressive-discount-banner",
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
    label: <Link to="/progressive-discount-banner">Discount Banner</Link>,
    key: "progressive-discount-banner",
    icon: <InsertRowAboveOutlined />,
  });

  return items;
});
