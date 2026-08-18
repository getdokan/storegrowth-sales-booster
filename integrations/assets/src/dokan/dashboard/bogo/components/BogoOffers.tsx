import { RawHTML, useCallback, useEffect, useMemo, useState } from "@wordpress/element";
import { __ } from "@wordpress/i18n";
// @ts-ignore
import { addQueryArgs } from "@wordpress/url";
// @ts-ignore
import { ToggleSwitch, useToast } from "@getdokan/dokan-ui";
// @ts-ignore
import apiFetch from "@wordpress/api-fetch";
// @ts-ignore
import { DataViews, DokanLink, PriceHtml } from "@dokan/components";

// Layout config for the table. Density lives inside the layout it belongs to;
// only the layouts offered in the switcher are declared.
const DEFAULT_LAYOUTS = {
  table: { density: "comfortable" },
  list: {},
};

const DEFAULT_PER_PAGE = 10;

const BogoOffers = ({ navigate }) => {
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [offersData, setOffersData] = useState([]);
  const [totalOffers, setTotalOffers] = useState(0);

  const getOfferProduct = (item) => {
    return item.bogo_deal_type === "same"
      ? item?.get_offered_product_info
      : item?.get_different_product_info;
  };

  // Get product name.
  const getProductName = (item) => {
    const offerProduct = getOfferProduct(item);
    return offerProduct?.name || "-";
  };

  // Get product price.
  const getProductPrice = (item) => {
    const offerProduct = getOfferProduct(item);
    return offerProduct?.price || "-";
  };

  // Get offer discounted amount.
  const getDiscountedAmount = (item) => {
    let discountedPrice = 0.0;
    const offerProduct = getOfferProduct(item);

    if ("discount" === item?.offer_type && offerProduct) {
      discountedPrice =
        offerProduct.price - offerProduct.price * (item?.discount_amount / 100);
    }

    return discountedPrice;
  };

  // View state for the table.
  const [view, setView] = useState({
    type: "table",
    page: 1,
    perPage: DEFAULT_PER_PAGE,
    search: "",
    fields: ["name_of_order_bogo", "status", "offered_products", "offers"],
    layout: {
      styles: {
        name_of_order_bogo: { width: "25%" },
        status: { width: "10%" },
        offered_products: { width: "30%" },
        offers: { width: "35%" },
      },
    },
  });

  // Handle offers fetching from the server.
  const fetchBogoOffers = useCallback(async () => {
    setIsLoading(true);

    try {
      // Query arguments.
      const queryArgs = {
        per_page: view?.perPage ?? DEFAULT_PER_PAGE,
        page: view?.page ?? 1,
      };

      const response = await apiFetch<any>({
        path: addQueryArgs(`/sales-booster/v1/bogo/offers`, queryArgs),
        parse: false,
      });

      const offers = await response.json();
      const totalItems = parseInt(response.headers.get("X-WP-Total"));

      setOffersData(offers);
      setTotalOffers(totalItems); // Set total items count.
    } catch (error) {
      // Handling the case where `error` is a Response object
      console.log("Error fetching BOGO offers:", error);
    } finally {
      setIsLoading(false);
    }
  }, [view.page, view.perPage]);

  // Handle offer status change.
  const handleStatusChange = async (checked, item) => {
    setIsLoading(true);

    try {
      // Query arguments.
      const queryArgs = {
        status: checked ? "yes" : "no",
      };

      const updatedItem = await apiFetch({
        path: addQueryArgs(
          `/sales-booster/v1/bogo/offers/${item?.id}/status`,
          queryArgs
        ),
        method: "POST",
      });

      if (updatedItem) {
        toast({
          type: "success",
          title: __(
            "BOGO offer status updated successfully.",
            "storegrowth-sales-booster"
          ),
        });
      }

      await fetchBogoOffers();
    } catch (error) {
      toast({
        type: "error",
        title:
          __(
            "Error updating BOGO offer status: ",
            "storegrowth-sales-booster"
          ) + error.error,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle delete offer. The confirmation dialog is rendered by DataViews
  // itself for actions flagged `isDestructive`, and this only runs on confirm.
  const deleteOffer = async (offer) => {
    if (!offer) {
      return;
    }

    setIsLoading(true);

    try {
      await apiFetch({
        // @ts-ignore
        path: `/sales-booster/v1/bogo/offers/${offer?.id}`,
        method: "DELETE",
      });

      toast({
        type: "success",
        title: __(
          "BOGO offer deleted successfully.",
          "storegrowth-sales-booster"
        ),
      });

      await fetchBogoOffers();
    } catch (error) {
      toast({
        type: "error",
        title:
          __("Error deleting BOGO offer: ", "storegrowth-sales-booster") +
          error.error,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fields for handle the table columns. DataViews renders its own skeleton
  // rows while `isLoading`, so no per-cell placeholders are needed here.
  const fields = useMemo(
    () => [
      {
        id: "name_of_order_bogo",
        label: __("Offer Name", "storegrowth-sales-booster"),
        enableSorting: false,
        render: ({ item }) => (
          <DokanLink
            as="div"
            onClick={() => {
              navigate(`/bogo/${item.id}`);
            }}
            className="font-bold cursor-pointer"
          >
            {item.name_of_order_bogo}
          </DokanLink>
        ),
      },
      {
        id: "status",
        label: __("Status", "storegrowth-sales-booster"),
        enableSorting: false,
        render: ({ item }) => (
          <ToggleSwitch
            checked={"active" === item.status}
            onChange={(status) => handleStatusChange(status, item)}
          />
        ),
      },
      {
        id: "offered_products",
        label: __("Target Product", "storegrowth-sales-booster"),
        enableSorting: false,
        render: ({ item }) => (
          <div className="dokan-bogo-product-name">
            <RawHTML>{item?.get_offered_product_info?.name || "-"}</RawHTML>
          </div>
        ),
      },
      {
        id: "offers",
        label: __("Offers", "storegrowth-sales-booster"),
        enableSorting: false,
        render: ({ item }) => (
          <ul className="dokan-bogo-product-name">
            <li>
              <RawHTML>{getProductName(item)}</RawHTML>
            </li>
            <li className="flex items-center gap-1">
              {__("Product Price: ", "storegrowth-sales-booster")}
              <PriceHtml price={getProductPrice(item)} />
            </li>
            <li className="flex items-center gap-1">
              {__("Discounted Price: ", "storegrowth-sales-booster")}{" "}
              <PriceHtml price={getDiscountedAmount(item)} />
            </li>
          </ul>
        ),
      },
    ],
    [navigate, fetchBogoOffers]
  );

  // Necessary actions for the table rows. Labels must resolve to plain
  // strings — DataViews also uses them for the row menu's accessible name.
  const actions = useMemo(
    () => [
      {
        id: "offer-edit",
        isEligible: (item) => !!item.id,
        label: () => __("Edit", "storegrowth-sales-booster"),
        callback: (offers) => {
          const offer = offers[0];
          navigate(`/bogo/${offer.id}`);
        },
      },
      {
        id: "offer-delete",
        isEligible: (item) => !!item.id,
        label: () => __("Delete", "storegrowth-sales-booster"),
        isDestructive: true,
        confirmTitle: __("Delete Offer", "storegrowth-sales-booster"),
        confirmMessage: __(
          "This BOGO offer will be removed permanently and will stop applying to any product it is attached to.",
          "storegrowth-sales-booster"
        ),
        confirmButtonLabel: __("Yes, Delete", "storegrowth-sales-booster"),
        cancelButtonLabel: __("Close", "storegrowth-sales-booster"),
        callback: (offers) => deleteOffer(offers[0]),
      },
    ],
    [navigate, fetchBogoOffers]
  );

  // Fetch offers when view changes.
  useEffect(() => {
    void fetchBogoOffers();
  }, [fetchBogoOffers]);

  return (
    <DataViews
      data={offersData}
      namespace="storegrowth-vendor-bogo-offers-data-view"
      defaultLayouts={DEFAULT_LAYOUTS}
      fields={fields}
      getItemId={(item) => String(item.id)}
      onChangeView={setView}
      search={false}
      paginationInfo={{
        // Pagination data for the table.
        totalItems: totalOffers,
        totalPages: Math.ceil(totalOffers / view.perPage),
      }}
      view={view}
      actions={actions}
      isLoading={isLoading}
      emptyTitle={__("No BOGO offers yet", "storegrowth-sales-booster")}
      emptyDescription={__(
        "Create your first offer to start giving away or discounting products.",
        "storegrowth-sales-booster"
      )}
    />
  );
};

export default BogoOffers;
