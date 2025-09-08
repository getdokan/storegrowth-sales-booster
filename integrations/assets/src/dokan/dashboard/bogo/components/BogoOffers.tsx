import { RawHTML, useEffect, useState } from "@wordpress/element";
import { __ } from "@wordpress/i18n";
// @ts-ignore
import { addQueryArgs } from "@wordpress/url";
// @ts-ignore
import { ToggleSwitch, useToast } from "@getdokan/dokan-ui";
// @ts-ignore
import apiFetch from "@wordpress/api-fetch";
// @ts-ignore
import { DataViews, DokanLink, DokanModal, PriceHtml } from "@dokan/components";

const BogoOffers = ({ navigate }) => {
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [offersData, setOffersData] = useState([]);
  const [currentOffer, setCurrentOffer] = useState(null);
  const [totalOffers, setTotalOffers] = useState(0);
  const [productIds, setProductIds] = useState<number[]>([]);
  const [productsMap, setProductsMap] = useState({});
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);

  // Get product name.
  const getProductName = (productId) => {
    if (productId && productsMap[productId] && productsMap[productId].name) {
      return productsMap[productId].name;
    }
    return "";
  };

  // Get product price.
  const getProductPrice = (productId) => {
    if (productId && productsMap[productId] && productsMap[productId].price) {
      return productsMap[productId].price;
    }
    return "";
  };

  // Get offer discounted amount.
  const getDiscountedAmount = (item) => {
    let discountedPrice = 0.0;
    let productId =
      "same" === item?.bogo_deal_type
        ? item?.offered_products
        : item?.get_different_product_field;
    let product = productId ? productsMap[productId] : null;

    if ("discount" === item?.offer_type && product) {
      discountedPrice =
        product.price - product.price * (item?.discount_amount / 100);
    }

    return discountedPrice;
  };

  // Handle orders fetching from the server.
  const fetchBogoOffers = async () => {
    setIsLoading(true);

    try {
      // Query arguments.
      const queryArgs = {
        per_page: view?.perPage ?? 10,
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

      // Include product IDs from offers.
      offers.forEach((offer) => {
        if (offer.offered_products) {
          const productId = offer.offered_products;
          if (!productIds.includes(productId)) {
            setProductIds((prevData) => {
              return [...prevData, productId];
            });
          }
        }

        if (offer.get_different_product_field) {
          const productId = offer.get_different_product_field;
          if (!productIds.includes(productId)) {
            setProductIds((prevData) => {
              return [...prevData, productId];
            });
          }
        }
      });
    } catch (error) {
      // Handling the case where `error` is a Response object
      console.log("Error fetching BOGO offers:", error);
    } finally {
      setIsLoading(false);
    }
  };

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

  // Handle delete offer confirmation.
  const handleOfferDeletion = (item) => {
    setCurrentOffer(item);
    setIsConfirmationModalOpen(true);
  };

  // Handle delete offer.
  const deleteOffer = async () => {
    if (!currentOffer) {
      return;
    }

    setIsLoading(true);

    try {
      await apiFetch({
        // @ts-ignore
        path: `/sales-booster/v1/bogo/offers/${currentOffer?.id}`,
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
      setIsConfirmationModalOpen(false);
    }
  };

  // Fields for handle the table columns.
  const fields = [
    {
      id: "name_of_order_bogo",
      label: __("Offer Name", "storegrowth-sales-booster"),
      render: ({ item }) => (
        <div>
          {isLoading ? (
            <span className="block w-24 h-3 rounded bg-gray-200 animate-pulse"></span>
          ) : (
            <DokanLink
              as="div"
              onClick={() => {
                navigate(`/bogo/${item.id}`);
              }}
              className="font-bold cursor-pointer"
            >
              {item.name_of_order_bogo}
            </DokanLink>
          )}
        </div>
      ),
      enableSorting: false,
      enableGlobalSearch: false,
    },
    {
      id: "status",
      label: __("Status", "storegrowth-sales-booster"),
      render: ({ item }) => (
        <div>
          {isLoading ? (
            <span className="block w-10 h-3 rounded bg-gray-200 animate-pulse"></span>
          ) : (
            <ToggleSwitch
              checked={"active" === item.status}
              onChange={(status) => handleStatusChange(status, item)}
            />
          )}
        </div>
      ),
      enableSorting: false,
      enableGlobalSearch: false,
    },
    {
      id: "offered_products",
      label: __("Target Product", "storegrowth-sales-booster"),
      render: ({ item }) => (
        <div className="dokan-bogo-product-name">
          {isLoading ? (
            <span className="block w-20 h-3 rounded bg-gray-200 animate-pulse"></span>
          ) : (
            <RawHTML>{getProductName(item?.offered_products)}</RawHTML>
          )}
        </div>
      ),
      enableSorting: false,
      enableGlobalSearch: false,
    },
    {
      id: "offers",
      label: __("Offers", "storegrowth-sales-booster"),
      render: ({ item }) => (
        <div>
          {isLoading ? (
            <>
              <span className="block w-24 h-3 rounded bg-gray-200 animate-pulse mb-2"></span>
              <span className="block w-20 h-3 rounded bg-gray-200 animate-pulse mb-2"></span>
              <span className="block w-16 h-3 rounded bg-gray-200 animate-pulse mb-2"></span>
              <span className="block w-28 h-3 rounded bg-gray-200 animate-pulse mb-2"></span>
              <span className="block w-16 h-3 rounded bg-gray-200 animate-pulse"></span>
            </>
          ) : (
            <ul className="dokan-bogo-product-name">
              <li>
                <RawHTML>
                  {getProductName(
                    item?.get_different_product_field
                      ? item.get_different_product_field
                      : item?.offered_products
                  )}
                </RawHTML>
              </li>
              <li className="flex items-center gap-1">
                {__("Product Price: ", "storegrowth-sales-booster")}
                <PriceHtml
                  price={getProductPrice(
                    item?.get_different_product_field
                      ? item.get_different_product_field
                      : item?.offered_products
                  )}
                />
              </li>
              <li className="flex items-center gap-1">
                {__("Discounted Price: ", "storegrowth-sales-booster")}{" "}
                <PriceHtml price={getDiscountedAmount(item)} />
              </li>
            </ul>
          )}
        </div>
      ),
      enableSorting: false,
      enableGlobalSearch: false,
    },
  ];

  // Necessary actions for the table rows.
  const actions = [
    {
      id: "offer-edit",
      label: "",
      isPrimary: true,
      isEligible: (item) => !!item.id,
      callback: (offers) => {
        const offer = offers[0];
        navigate(`/bogo/${offer.id}`);
      },
      icon: () => (
        <span
          className={`px-2 bg-transparent font-medium text-dokan-link hover:text-dokan-link-hover pr-r text-sm`}
        >
          {__("Edit", "storegrowth-sales-booster")}
        </span>
      ),
    },
    {
      id: "offer-delete",
      label: "",
      isPrimary: true,
      isEligible: (item) => !!item.id,
      icon: () => {
        return (
          <span
            className={`px-2 bg-transparent font-medium text-dokan-danger hover:text-dokan-danger-hover text-sm`}
          >
            {__("Delete", "storegrowth-sales-booster")}
          </span>
        );
      },
      callback: (offers) => {
        handleOfferDeletion(offers[0]);
      },
    },
  ];

  // Data view default layout.
  const defaultLayouts = {
    table: {},
    grid: {},
    list: {},
    density: "comfortable", // Use density pre-defined values: comfortable, compact, cozy
  };

  // View state for handle the table view.
  const [view, setView] = useState({
    perPage: 10,
    page: 1,
    type: "table",
    titleField: "id",
    status: "completed,failed,cancelled",
    layout: defaultLayouts,
    fields: fields.map((field) => (field.id !== "id" ? field.id : "")),
  });

  // Fetch offers when view changes.
  useEffect(() => {
    fetchBogoOffers();
  }, [view.page, view.perPage]);

  // Fetch products data when product IDs change.
  useEffect(() => {
    productIds.forEach(async (productId) => {
      if (!productsMap[productId]) {
        if (productId > 0) {
          let product = await apiFetch({
            path: `/dokan/v1/products/${productId}`,
            method: "GET",
          });

          setProductsMap((prevMap) => ({
            ...prevMap,
            [productId]: product,
          }));
        }
      }
    });
  }, [productIds]);

  return (
    <>
      <DataViews
        data={offersData}
        namespace="dokan-vendor-subscription-orders-data-view"
        defaultLayouts={{ ...defaultLayouts }}
        fields={fields}
        getItemId={(item) => item.id}
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
        topPanel={false}
      />

      <DokanModal
        isOpen={isConfirmationModalOpen}
        namespace="storegrowth-dokan-vendor-bogo-offer-delete"
        dialogTitle={__("Delete Offer", "storegrowth-sales-booster")}
        confirmationTitle={__(
          "Are you sure you want to proceed?",
          "storegrowth-sales-booster"
        )}
        confirmationDescription={__(
          "Deleting this offer will prevent further completion of this subscription purchase.",
          "storegrowth-sales-booster"
        )}
        confirmButtonText={__("Yes, Delete", "storegrowth-sales-booster")}
        cancelButtonText={__("Close", "storegrowth-sales-booster")}
        onConfirm={() => deleteOffer()}
        onClose={() => setIsConfirmationModalOpen(false)}
      />
    </>
  );
};

export default BogoOffers;
