import { addFilter } from "@wordpress/hooks";
import { __ } from "@wordpress/i18n";
import VendorInfo from "./VendorInfo";

addFilter(
  "spsg_quick_cart_content_settings",
  "spsg_quick_cart_content_settings_callback",
  (contentOptions) => {
    return [
      ...contentOptions,
      {
        name: "show_quick_cart_dokan_store_names",
        title: __("Show Store Names", "storegrowth-sales-booster"),
      },
      {
        name: "enable_quick_cart_dokan_store_links",
        title: __("Enable Store Links", "storegrowth-sales-booster"),
      },
    ];
  }
);

addFilter("spsg_quick_cart_state", "spsg_quick_cart_state_callback", (data) => {
  return {
    ...data,
    show_quick_cart_dokan_store_names: true,
    enable_quick_cart_dokan_store_links: true,
  };
});

addFilter(
    'spsg_cart_product_detail_after',
    'spsg_fly_cart_product_detail_after_callback',
    (data, storeData) => <VendorInfo storeData={storeData} />
)
