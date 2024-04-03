import { addFilter, applyFilters } from "@wordpress/hooks";
import OrderBump from "./components/OrderBump";
import { __ } from "@wordpress/i18n";
import { ShoppingCartOutlined } from "@ant-design/icons";
import OrderBumpList from "./components/OrderBumpList";
import CreateBump from "./components/CreateBump";
import { register } from "@wordpress/data";

import OrderBumpStore from "./store";
import PlanUpgradeModal from "sales-booster/src/components/pro-previews/PromptNotice/PlanUpgradeModal";

register(OrderBumpStore);

/**
 * Add routes to sidebar.
 */

addFilter(
  "sgsb_routes",
  "sgsb",
  (routes, outlet, navigate, useParams, useSearchParams) => {
    const moduleName = "frequently-bought";

    routes.push({
      name: moduleName,
      promptEnable:true,
      label: "FBT",
      path: "/frequently-bought",
      exact: true,
      element: <PlanUpgradeModal />,
    });

    return routes;
  }
);

/**
 * Add sidebar menu items
 */
addFilter("sidebar_menu_items", "sgsb", (items, Link) => {
  items.push({
    label: <Link to="/frequently-bought">Frequently Bought Together</Link>,
    key: "frequently-bought",
    icon: <ShoppingCartOutlined />,
  });

  return items;
});
