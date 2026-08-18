import { addFilter } from "@wordpress/hooks";
import { __ } from "@wordpress/i18n";
import AdvancedSettings from "./AdvancedSettings";

/**
 * Register the global "Advanced" settings route.
 *
 * The settings sidebar renders every route contributed through `spsg_routes`,
 * so pushing one entry here adds both the menu item and the page. Unlike the
 * module routes this one is always present — it is not tied to a module.
 */
addFilter("spsg_routes", "spsg/advanced", (routes) => {
  routes.push({
    name: "advanced",
    label: __("Settings", "storegrowth-sales-booster"),
    path: "/advanced",
    element: <AdvancedSettings />,
  });

  return routes;
});
