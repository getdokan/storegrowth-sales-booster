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
import { useParams } from 'react-router-dom';

register(BogoStore);
register(moduleStore);

/*
* A fallback for useSearchParams in case it's not available (for older dokan version) script won't break
* TODO: It will be removed once we drop support for older dokan versions
* @see https://github.com/getdokan/dokan/pull/2893 Ref PR where useSearchParams was added
*/
const useSearchParamsFallback = () => {
    const searchParams = new URLSearchParams(window.location.search);
    return [
        searchParams,
        () => {}
    ]
}

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
  if (spsgAdmin?.isPro) {
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

  addFilter(
      'spsg_bogo_deal_type_options',
      'spsg_bogo_deal_type_options_callback',
      (options) => {
          // @ts-ignore
          if(spsgAdmin.buyXGetXEnableForVendor && spsgAdmin.isPro) {
              return options;
          }
          return options.filter((option) => option.key !== 'same');
      }
  );

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
          return <CreateBogo useParams={useParams} useSearchParams={useSearchParamsFallback} {...props} />;
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
          return <CreateBogo useParams={useParams} useSearchParams={useSearchParamsFallback} {...props} />;
        },
        backUrl: "/bogo",
      });

      return routes;
    }
  );
});
