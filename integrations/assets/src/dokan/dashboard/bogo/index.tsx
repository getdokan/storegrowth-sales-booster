import "./index.scss";
// @ts-ignore
import { register } from "@wordpress/data";
import { addFilter } from "@wordpress/hooks";
// @ts-ignore
import domReady from "@wordpress/dom-ready";
// @ts-ignore
import { Fill } from "@wordpress/components";
// @ts-ignore
import { registerPlugin } from "@wordpress/plugins";
// @ts-ignore
import { DokanButton } from "@dokan/components";
import { __ } from "@wordpress/i18n";
import moduleStore from "../../../../../../assets/src/modules-store";
import CreateBogo from "../../../../../../modules/bogo/assets/src/components/CreateBogo";
import BogoStore from "../../../../../../modules/bogo/assets/src/store";
import BogoList from "./components/BogoOffers";

register(BogoStore);
register(moduleStore);

const AddOfferCreateButton = () => {
  return (
    <Fill name="dokan-header-actions">
      {({ navigate }) => (
        <DokanButton onClick={() => navigate("/bogo/create-bogo")}>
          {__("Create New Offer", "storegrowth-sales-booster")}
        </DokanButton>
      )}
    </Fill>
  );
};

registerPlugin("storegrowth-dokan-vendor-bogo", {
  render: AddOfferCreateButton,
  scope: "storegrowth-dokan-vendor-bogo",
});

domReady(() => {
  // @ts-ignore
  if (window.spsgAdmin?.isPro) {
    addFilter(
      "spsg_hide_bogo_premium_options",
      "spsg_bogo_render_upgrade_message_callback",
      () => false
    );
    addFilter(
      "spsg_edit_bogo_message",
      "spsg_edit_bogo_message_callback",
      () => false
    );
  }

  // @ts-ignore
  window.wp.hooks.addFilter(
    "dokan-dashboard-routes",
    "storegrowth-dokan-vendor-bogo",
    function (routes) {
      routes.push({
        id: "storegrowth-dokan-vendor-bogo",
        title: __("StoreGrowth BOGO", "storegrowth-sales-booster"),
        path: "/bogo",
        exact: true,
        // @ts-ignore
        element: <BogoList />,
      });

      return routes;
    }
  );

  // @ts-ignore
  window.wp.hooks.addFilter(
    "dokan-dashboard-routes",
    "storegrowth-dokan-vendor-bogo-create",
    function (routes) {
      routes.push({
        id: "storegrowth-dokan-vendor-bogo-create",
        title: __("StoreGrowth BOGO Create", "storegrowth-sales-booster"),
        path: "/bogo/create-bogo",
        exact: true,
        element: (props) => {
          return <CreateBogo {...props} />;
        },
        backUrl: "/bogo",
      });

      return routes;
    }
  );

  // @ts-ignore
  window.wp.hooks.addFilter(
    "dokan-dashboard-routes",
    "storegrowth-dokan-vendor-bogo-edit",
    function (routes) {
      routes.push({
        id: "storegrowth-dokan-vendor-bogo-edit",
        title: __("StoreGrowth BOGO Edit", "storegrowth-sales-booster"),
        path: "/bogo/:bogo_id",
        exact: true,
        element: (props) => {
          return <CreateBogo {...props} />;
        },
        backUrl: "/bogo",
      });

      return routes;
    }
  );
});
