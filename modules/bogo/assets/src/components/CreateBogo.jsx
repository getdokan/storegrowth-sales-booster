import { __ } from "@wordpress/i18n";
import { Form, notification, Modal } from "antd";
import { useDispatch, useSelect } from "@wordpress/data";
import { useEffect, useState } from "@wordpress/element";
import {
  convertBogoItemHtmlEntitiesToTexts,
  convertBogoItemTextDatasToHtmlEntities,
} from "../helper";
import { getBogoOffers, getBogoOffer, createBogoOffer, updateBogoOffer, deleteBogoOffer } from "../utils/restApi";
import BasicInfo from "./BasicInfo";
import PanelPreview from "sales-booster/src/components/settings/Panels/PanelPreview";
import PanelRow from "sales-booster/src/components/settings/Panels/PanelRow";
import PanelSettings from "sales-booster/src/components/settings/Panels/PanelSettings";
import DesignSection from "./DesignSection";
import Preview from "./Preview";
import { createBogoForm } from "../helper";
import ActionsHandler from "sales-booster/src/components/settings/Panels/PanelSettings/ActionsHandler";
import TouchPreview from "sales-booster/src/components/settings/Panels/TouchPreview";
import ContentSection from "./appearance/ContentSection";

function CreateBogo({ navigate, useParams, useSearchParams }) {
  const [allBogosData, setallBogosData] = useState([]);
  const [duplicateDataError, setDuplicateDataError] = useState({});
  const { setPageLoading } = useDispatch("spsg");
  const [buttonLoading, setButtonLoading] = useState(false);
  const { setCreateFromData, resetCreateFromData } = useDispatch("spsg_bogo");
  let { bogo_id, action_name } = useParams();

  const { bogoData, createBogoData } = useSelect((select) => ({
    createBogoData: select("spsg_bogo").getCreateFromData(),
    bogoData: wp.data.select("spsg_bogo").getBogoData(),
  }));
  useEffect(() => {
    if (!bogoData?.length > 0) {
      setPageLoading(true);
      getBogoOffers()
        .then((response) => {
          setPageLoading(false);
          const bogoDataParsed = response.map((bogoItem) =>
            convertBogoItemHtmlEntitiesToTexts(bogoItem)
          );
          setallBogosData(bogoDataParsed);
        })
        .catch((error) => {
          setPageLoading(false);
          console.error('Failed to fetch BOGO offers:', error);
          notification["error"]({
            message: "Failed to load BOGO offers",
            description: error.message,
          });
        });
    } else {
      setallBogosData(bogoData);
    }
  }, []);


  const changeTab = (key) => {
    // Check if we're editing an existing BOGO (bogo_id exists)
    if (bogo_id) {
      navigate(`/bogo/${bogo_id}?tab_name=${key}`);
    } else {
      navigate("/bogo/create-bogo?tab_name=" + key);
    }
  };

  if (action_name == "delete") {
    Modal.confirm({
      title: __("Delete BOGO Offer", "storegrowth-sales-booster"),
      content: __("Are you sure you want to delete this BOGO offer? This action cannot be undone.", "storegrowth-sales-booster"),
      okText: __("Delete", "storegrowth-sales-booster"),
      okType: 'danger',
      cancelText: __("Cancel", "storegrowth-sales-booster"),
      onOk() {
        setPageLoading(true);
        deleteBogoOffer(bogo_id)
          .then(() => {
            setPageLoading(false);
            notification["success"]({
              message: __("BOGO offer deleted successfully", "storegrowth-sales-booster"),
            });
            navigate("/bogo");
          })
          .catch((error) => {
            setPageLoading(false);
            console.error('Failed to delete BOGO offer:', error);
            notification["error"]({
              message: __("Failed to delete BOGO offer", "storegrowth-sales-booster"),
              description: error.message,
            });
          });
      },
    });
  }

  if (bogo_id) {
    useEffect(() => {
      setPageLoading(true);
      getBogoOffer(bogo_id)
        .then((data) => {
          setPageLoading(false);

          const parsedBogoItem = convertBogoItemHtmlEntitiesToTexts(data);
          setCreateFromData({
            ...createBogoData,
            ...parsedBogoItem,
            offer_product_id: bogo_id,
          });
        })
        .catch((error) => {
          setPageLoading(false);
          console.error('Failed to fetch BOGO offer:', error);
          notification["error"]({
            message: "Failed to load BOGO offer",
            description: error.message,
          });
        });
    }, []);
  } else {
    useEffect(() => {
      resetCreateFromData();
    }, []);
  }

  const layout = {
    labelCol: {
      span: 8,
    },
    wrapperCol: {
      span: 15,
    },
  };

  const onFormSave = () => {
    if (!createBogoData.name_of_order_bogo) {
      notification["error"]({
        message: "Please enter name of order bogo",
      });
      return null;
    }

    if (
      createBogoData.offered_products.length == 0 &&
      createBogoData.offered_categories.length == 0
    ) {
      notification["error"]({
        message:
          "You have to select target products or target categories or both",
      });

      return null;
    }

    if (createBogoData.offer_schedule.length == 0) {
      notification["error"]({
        message: "Please select bogo schedule",
      });

      return null;
    }

    if (!createBogoData.get_different_product_field && createBogoData.bogo_deal_type !== 'same') {
      notification["error"]({
        message: "Please select offer product",
      });

      return null;
    }

    if (!createBogoData.offer_type || createBogoData.offer_type.length === 0) {
      notification["error"]({
        message: "Please select offer type",
      });

      return null;
    }

    if (createBogoData.offer_type !== "free" && !createBogoData.discount_amount) {
      notification["error"]({
        message: "Please select offer amount",
      });

      return null;
    }

    const isEditingExistingBogoItem =
      typeof bogo_id == "string" &&
      !isNaN(bogo_id) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)
      !isNaN(parseFloat(bogo_id)); // if bogo_id is just whitespaces then fail
    const intBogoId = isEditingExistingBogoItem && parseInt(bogo_id);
    const filteredBogosData = isEditingExistingBogoItem
      ? allBogosData.filter((item) => item.id !== intBogoId)
      : allBogosData;

    const duplicateErrs = {
      duplicateTargetCats: [],
      duplicateTargetProducts: [],
    };

    const newOfferProduct = createBogoData.get_different_product_field;
    const newTargetCats = createBogoData?.offered_categories;
    const newTargetProducts = createBogoData.offered_products;
    const newTargetSchedules = createBogoData.offer_schedule;

    for (const bogoItem of filteredBogosData) {
      if (parseInt(bogoItem.get_different_product_field) !== parseInt(newOfferProduct)) {
        continue;
      }
      let isSameScheduleExist = false;
      for (const newScheduleItem of newTargetSchedules) {
        if (bogoItem.offer_schedule?.includes(newScheduleItem)) {
          isSameScheduleExist = true;
          break;
        }
      }
      if (!isSameScheduleExist) {
        continue;
      }
      // for (const newCatItem of newTargetCats) {
      //   if (bogoItem.offered_categories.includes(newCatItem)) {
      //     duplicateErrs.duplicateTargetCats.push(newCatItem);
      //     break;
      //   }
      // }
      for (const newProductItem of newTargetProducts) {
        if (bogoItem.offered_products.includes(newProductItem)) {
          duplicateErrs.duplicateTargetProducts.push(newProductItem);
          break;
        }
      }
      if (
        duplicateErrs.duplicateTargetCats.length > 0 ||
        duplicateErrs.duplicateTargetProducts.length > 0
      ) {
        if (window.location.hash === "#/bogo/create-bogo") {
          setDuplicateDataError(duplicateErrs);
          return false;
        }
      }
    }

    // Check if bogo order not duplicate then saved.
    if (!(isDuplicateCatsFound || isDuplicateProductsFound)) {
      setButtonLoading(true);
      const bogoDataParsedToEntities =
        convertBogoItemTextDatasToHtmlEntities(createBogoData);
      
      const apiCall = isEditingExistingBogoItem 
        ? updateBogoOffer(parseInt(bogo_id), bogoDataParsedToEntities)
        : createBogoOffer(bogoDataParsedToEntities);
      
      apiCall
        .then((data) => {
          setCreateFromData({
            ...bogoDataParsedToEntities,
            offer_product_id: data.id || data,
          });
          setButtonLoading(false);

          const successMessage = isEditingExistingBogoItem 
            ? "Order Bogo Update"
            : "Order Bogo Creation";
          const successDescription = isEditingExistingBogoItem
            ? "Data for order bogo update saved successfully"
            : "Data for order bogo creation saved successfully";

          notification["success"]({
            message: successMessage,
            description: successDescription,
          });

          navigate("/bogo?tab_name=lists");
        })
        .catch((error) => {
          setButtonLoading(false);
          const errorMessage = isEditingExistingBogoItem
            ? "Failed to update BOGO offer"
            : "Failed to create BOGO offer";
          console.error(errorMessage + ':', error);
          notification["error"]({
            message: errorMessage,
            description: error.message,
          });
        });
    }
  };

  const onFormReset = () => {
    setCreateFromData({ ...createBogoForm });
  };

  const clearErrors = () => setDuplicateDataError({});
  const isDuplicateCatsFound =
    duplicateDataError?.duplicateTargetCats?.length > 0;
  const isDuplicateProductsFound =
    duplicateDataError?.duplicateTargetProducts?.length > 0;

  const [searchParams, setSearchParams] = useSearchParams();
  const tabName = searchParams.get("tab_name");

  const tabPanels = [
    {
      key: "basic",
      title: __("Basic Information", "storegrowth-sales-booster"),
      panel: <BasicInfo clearErrors={clearErrors} />,
    },
    {
      key: "design",
      title: __("Design", "storegrowth-sales-booster"),
      panel: <DesignSection />,
    },
    {
      key: "content",
      title: __("Content", "storegrowth-sales-booster"),
      panel: <ContentSection />,
    },
  ];

  const excludeTabs = ["basic"];
  const showPreview = !excludeTabs?.includes(tabName);

  return (
    <>
      <Form {...layout}>
        <PanelRow>
          <PanelSettings
            colSpan={showPreview && tabName ? 12 : 24}
            tabPanels={tabPanels}
            changeHandler={changeTab}
            activeTab={tabName ? tabName : "basic"}
          />
          {showPreview && tabName && (
            <PanelPreview colSpan={12}>
              <Preview storeData={createBogoData} />
            </PanelPreview>
          )}
        </PanelRow>

        {/* Render preview panel for responsive preview. */}
        <TouchPreview previewWidth={400}>
          <Preview storeData={createBogoData} />
        </TouchPreview>

        {(isDuplicateCatsFound || isDuplicateProductsFound) &&
          notification["error"]({
            message: __(
              `Error!!! another bogo with the given offer product for the specified schedule already exists for the selected ${isDuplicateCatsFound && isDuplicateProductsFound
                ? "categories & products"
                : isDuplicateProductsFound
                  ? "products"
                  : "categories"
              }. Please change your inputs and then try again.`,
              "storegrowth-sales-booster"
            ),
          })}

        <ActionsHandler
          saveHandler={onFormSave}
          resetHandler={onFormReset}
          loadingHandler={buttonLoading}
        />
      </Form>
    </>
  );
}

export default CreateBogo;
