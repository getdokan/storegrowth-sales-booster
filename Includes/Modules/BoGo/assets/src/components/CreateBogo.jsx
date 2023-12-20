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
import { createBumpForm } from "../helper";
import ActionsHandler from "sales-booster/src/components/settings/Panels/PanelSettings/ActionsHandler";
import TouchPreview from "sales-booster/src/components/settings/Panels/TouchPreview";

function CreateBogo({ navigate, useParams, useSearchParams }) {
  const [allBumpsData, setallBumpsData] = useState([]);
  const [duplicateDataError, setDuplicateDataError] = useState({});
  const [isModalVisible, setIsModalVisible] = useState(false);
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
        bump_save_url.ajax_url,
        {
          action: "bump_list",
          data: [],
          _ajax_nonce: bump_save_url.ajd_nonce,
        },
        function (bumpDataFromAjax) {
          setPageLoading(false);
          const bumpDataParsed = bumpDataFromAjax.data.map((bogoItem) =>
            convertBogoItemHtmlEntitiesToTexts(bogoItem)
          );
          setallBumpsData(bumpDataParsed);
        }
      );
    } else {
      setallBumpsData(bogoData);
    }
  }, []);

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleOk = () => {
    setIsModalVisible(false);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const changeTab = (key) => {
    navigate("/bogo/create-bogo?tab_name=" + key);
  };

  if (action_name == "delete") {
    setPageLoading(true);
    let $ = jQuery;
    $.post(
      bump_save_url.ajax_url,
      {
        action: "bump_delete",
        data: bogo_id,
        _ajax_nonce: bump_save_url.ajd_nonce,
      },
      function (data) {
        setPageLoading(false);
        notification["error"]({
          message: "Order Bump deleted",
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
        bump_save_url.ajax_url,
        {
          action: "bump_list",
          data: bogo_id,
          _ajax_nonce: bump_save_url.ajd_nonce,
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
    if (!createBogoData.name_of_order_bump) {
      notification["error"]({
        message: "Please enter name of order bump",
      });
      return null;
    }

    if (
      createBogoData.target_products.length == 0 &&
      createBogoData.target_categories.length == 0
    ) {
      notification["error"]({
        message:
          "You have to select target products or target categories or both",
      });

      return null;
    }

    if (createBogoData.bump_schedule.length == 0) {
      notification["error"]({
        message: "Please select bump schedule",
      });

      return null;
    }

    if (!createBogoData.offer_product) {
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

    if (!createBogoData.offer_amount) {
      notification["error"]({
        message: "Please select offer amount",
      });

      return null;
    }

    const isEditingExistingBogoItem =
      typeof bogo_id == "string" &&
      !isNaN(bogo_id) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)
      !isNaN(parseFloat(bogo_id)); // if bogo_id is just whitespaces then fail
    const intBumpId = isEditingExistingBogoItem && parseInt(bogo_id);
    const filteredBumpsData = isEditingExistingBogoItem
      ? allBumpsData.filter((item) => item.id !== intBumpId)
      : allBumpsData;

    const duplicateErrs = {
      duplicateTargetCats: [],
      duplicateTargetProducts: [],
    };

    const newOfferProduct = createBogoData.offer_product;
    const newTargetCats = createBogoData.target_categories;
    const newTargetProducts = createBogoData.target_products;
    const newTargetSchedules = createBogoData.bump_schedule;

    for (const bogoItem of filteredBumpsData) {
      if (parseInt(bogoItem.offer_product) !== parseInt(newOfferProduct)) {
        continue;
      }
      let isSameScheduleExist = false;
      for (const newScheduleItem of newTargetSchedules) {
        if (bogoItem.bump_schedule.includes(newScheduleItem)) {
          isSameScheduleExist = true;
          break;
        }
      }
      if (!isSameScheduleExist) {
        continue;
      }
      for (const newCatItem of newTargetCats) {
        if (bogoItem.target_categories.includes(newCatItem)) {
          duplicateErrs.duplicateTargetCats.push(newCatItem);
          break;
        }
      }
      for (const newProductItem of newTargetProducts) {
        if (bogoItem.target_products.includes(newProductItem)) {
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

    // Check if bump order not duplicate then saved.
    if (!(isDuplicateCatsFound || isDuplicateProductsFound)) {
      setButtonLoading(true);
      const bumpDataParsedToEntities =
        convertBogoItemTextDatasToHtmlEntities(createBogoData);
      let $ = jQuery;
      $.post(
        bump_save_url.ajax_url,
        {
          action: "bump_create",
          data: bumpDataParsedToEntities,
          _ajax_nonce: bump_save_url.ajd_nonce,
        },
        function (data) {
          setCreateFromData({
            ...bumpDataParsedToEntities,
            offer_product_id: data,
          });
          setButtonLoading(false);

          notification["success"]({
            message: "Order Bump Creation",
            description: "Data for order bump creation saved successfully",
          });

          navigate("/bogo");
        }
      );
    }
  };

  const onFormReset = () => {
    setCreateFromData({ ...createBumpForm });
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
              `Error!!! another bump with the given offer product for the specified schedule already exists for the selected ${isDuplicateCatsFound && isDuplicateProductsFound
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
