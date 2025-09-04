import { addFilter } from "@wordpress/hooks";
import { __ } from "@wordpress/i18n";
import VendorsSettings from "./VendorsSettings";

addFilter("spsg_bogo_tab_panels", "spsg_bogo_tab_panels_callback", (panels) => {
  return [
    ...panels,
    {
      key: "vendors",
      title: __("Vendors", "storegrowth-sales-booster"),
      panel: <VendorsSettings />,
    },
  ];
});
