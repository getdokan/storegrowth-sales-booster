import { __ } from "@wordpress/i18n";
import { Form, notification } from "antd";
import { useDispatch, useSelect } from "@wordpress/data";
import { useEffect, useState } from "@wordpress/element";
import {
  convertBogoItemHtmlEntitiesToTexts,
  convertBogoItemTextDatasToHtmlEntities,
} from "../helper";
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
  const { setPageLoading } = useDispatch("sgsb");
  const [buttonLoading, setButtonLoading] = useState(false);
  const { setCreateFromData, resetCreateFromData } = useDispatch("sgsb_bogo");
  let { bogo_id, action_name } = useParams();

  const { bogoData, createBogoData } = useSelect((select) => ({
    createBogoData: select("sgsb_bogo").getCreateFromData(),
    bogoData: wp.data.select("sgsb_bogo").getBogoData(),
  }));
  useEffect(() => {
    if (!bogoData?.length > 0) {
      setPageLoading(true);
      jQuery.post(
        bogo_save_url.ajax_url,
        {
          action: "bogo_list",
          data: [],
          _ajax_nonce: bogo_save_url.ajd_nonce,
        },
        function (bogoDataFromAjax) {
          setPageLoading(false);
          const bogoDataParsed = bogoDataFromAjax.data.map((bogoItem) =>
            convertBogoItemHtmlEntitiesToTexts(bogoItem)
          );
          setallBogosData(bogoDataParsed);
        }
      );
    } else {
      setallBogosData(bogoData);
    }
  }, []);


  const changeTab = (key) => {
    navigate("/bogo/create-bogo?tab_name=" + key);
  };

  if (action_name == "delete") {
    setPageLoading(true);
    let $ = jQuery;
    $.post(
      bogo_save_url.ajax_url,
      {
        action: "bogo_delete",
        data: bogo_id,
        _ajax_nonce: bogo_save_url.ajd_nonce,
      },
      function (data) {
        setPageLoading(false);
        notification["error"]({
          message: "Order Bogo deleted",
        });
        navigate("/bogo");
      }
    );
  }

  if (bogo_id) {
    useEffect(() => {
      setPageLoading(true);
      let $ = jQuery;
      $.post(
        bogo_save_url.ajax_url,
        {
          action: "bogo_list",
          data: bogo_id,
          _ajax_nonce: bogo_save_url.ajd_nonce,
        },
        function (data) {
          setPageLoading(false);

          const parsedBogoItem = convertBogoItemHtmlEntitiesToTexts(data.data);
          setCreateFromData({
            ...createBogoData,
            ...parsedBogoItem,
            offer_product_id: bogo_id,
          });
        }
      );
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

    if (createBogoData.offer_type.length == 0) {
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
        if (bogoItem.offer_schedule.includes(newScheduleItem)) {
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
      let $ = jQuery;
      $.post(
        bogo_save_url.ajax_url,
        {
          action: "bogo_create",
          data: bogoDataParsedToEntities,
          _ajax_nonce: bogo_save_url.ajd_nonce,
        },
        function (data) {
          setCreateFromData({
            ...bogoDataParsedToEntities,
            offer_product_id: data,
          });
          setButtonLoading(false);

          notification["success"]({
            message: "Order Bogo Creation",
            description: "Data for order bogo creation saved successfully",
          });

          navigate("/bogo?tab_name=lists");
        }
      );
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
