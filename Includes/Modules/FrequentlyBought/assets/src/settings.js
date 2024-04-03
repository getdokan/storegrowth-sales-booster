import { addFilter,applyFilters } from "@wordpress/hooks";
import { __ } from "@wordpress/i18n";
import PlanUpgradeModal from "sales-booster/src/components/pro-previews/PromptNotice/PlanUpgradeModal";

/**
 * Add routes to sidebar.
 */

const componentObject = {
  element: <PlanUpgradeModal />, // Assuming PlanUpgradeModal is a valid component
};

addFilter(
  "sgsb_routes",
  "sgsb",
  (routes, outlet, navigate, useParams, useSearchParams) => {
    const moduleName = "frequently-bought";
    let routesData = applyFilters("sgsb_fbt_settings_enable", componentObject,outlet, navigate, useParams, useSearchParams,moduleName);

    routes.push({
      name: moduleName,
      label: "FBT",
      path: "/frequently-bought",
      exact: true,
      ...routesData,
    });

    return routes;
  }
);


