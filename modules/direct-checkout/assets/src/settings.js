import { addFilter } from "@wordpress/hooks";
import { StockOutlined } from "@ant-design/icons";
import { register } from "@wordpress/data";
import DirectCheckout from "./components/DirectCheckout";
import DirectCheckoutLayout from "./components/DirectCheckoutLayout";


import DirectCheckoutStore from "./store";
register(DirectCheckoutStore);

/**
 * Add routes to sidebar.
 */
addFilter(
  "sgsb_routes",
  "sgsb",
  (routes, outlet, navigate, useParams, useSearchParams) => {

    const moduleName = "direct-checkout";

    routes.push({
      name: moduleName,
      label:"Direct Checkout",
      path: "/direct-checkout",
      exact: true,
      element: (
        <DirectCheckout
          outlet={outlet}
          navigate={navigate}
          useParams={useParams}
          useSearchParams={useSearchParams}
        />
      ),
      children: [
        {
          index: true,
          element: (
            <DirectCheckoutLayout
              moduleId={moduleName}
              navigate={navigate}
              useParams={useParams}
              useSearchParams={useSearchParams}
            />
          ),
        },
      ],
    });

    return routes;
  }
);

/**
 * Add sidebar menu items
 */
addFilter("sidebar_menu_items", "sgsb", (items, Link) => {
  items.push({
    label: <Link to="/direct-checkout?tab_name=general">Direct Checkout</Link>,
    key: "direct-checkout",
    icon: <StockOutlined />,
  });

  return items;
});
