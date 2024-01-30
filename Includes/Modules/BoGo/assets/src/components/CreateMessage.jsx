import { __ } from "@wordpress/i18n";
import { Form, notification } from "antd";
import { useDispatch, useSelect } from "@wordpress/data";
import { useEffect, useState } from "@wordpress/element";
import PanelRow from "sales-booster/src/components/settings/Panels/PanelRow";
import PanelSettings from "sales-booster/src/components/settings/Panels/PanelSettings";
import ActionsHandler from "sales-booster/src/components/settings/Panels/PanelSettings/ActionsHandler";
import CategoryInfo from "./CategoryInfo";

function CreateMessage({ navigate, useParams }) {
  const [buttonLoading, setButtonLoading] = useState(false);

  let { category_id } = useParams();
  const [categoryId, setCategoryId] = useState(category_id || 0);
  const [categoryList, setCategoryList] = useState(bogo_products_and_categories.category_list.catForSelect);
  const [pickedCategoryObj, setPickedCategoryObj] = useState({});
  const [categoryMessage, setCategoryMessage] = useState(
    __('Buy 1, unit of any product from this category and get 1 unit free of the same product', 'storegrowth-sales-booster')
  );

  const { setBogoGlobalSettings } = useDispatch("sgsb_bogo");
  const { bogoGlobalSettingsData: currentSettings } = useSelect((select) => ({
    bogoGlobalSettingsData: select("sgsb_bogo").getBogoGlobalSettings(),
  }));

  const layout = {
    labelCol: {
      span: 8,
    },
    wrapperCol: {
      span: 15,
    },
  };

  const onFormSave = () => {
    if (!categoryId) {
      notification["error"]({
        message: "You have to select target BOGO category for message",
      });
      return null;
    }

    if (!categoryMessage) {
      notification["error"]({
        message: "Please enter your BOGO category page message for target category",
      });
      return null;
    }

    setButtonLoading(true);
    let $ = jQuery;

    const data = {
      id: categoryId,
      message: categoryMessage,
      categoryStatus: !category_id ? true : pickedCategoryObj?.categoryStatus,
    }

    if (category_id) {
      data.editableId = category_id;
    }

    $.post(
      bogo_save_url.ajax_url,
      {
        data,
        action: "bogo_category_msg_create",
        _ajax_nonce: bogo_save_url.ajd_nonce,
      },
      function (response) {
        if (!category_id) {
          setBogoGlobalSettings({
            ...currentSettings,
            bogo_category_messages: [
              ...currentSettings?.bogo_category_messages,
              { id: categoryId, message: categoryMessage, status: 'yes' }
            ],
          });
        } else {
          setBogoGlobalSettings({
            ...currentSettings,
            bogo_category_messages: [
              ...currentSettings?.bogo_category_messages,
              {
                ...pickedCategoryObj,
                id: categoryId,
                message: categoryMessage,
                categoryStatus: pickedCategoryObj?.categoryStatus,
              },
            ],
          });
        }

        setButtonLoading(false);

        notification["success"]({
          message: __("Category Message Created", 'storegrowth-sales-booster'),
          description: __("BOGO category message has been created successfully", 'storegrowth-sales-booster'),
        });

        navigate("/bogo?tab_name=messages");
      }
    );
  };

  const onFormReset = () => {
    if (category_id) {
      setCategoryId(category_id);
      setCategoryMessage(pickedCategoryObj?.message);
    } else {
      setCategoryId('');
      setCategoryMessage(
        __('Buy 1, unit of any product from this category and get 1 unit free of the same product', 'storegrowth-sales-booster')
      );
    }
  };

  useEffect(() => {
    jQuery.post(
      bogo_save_url.ajax_url,
      {
        action: "bogo_category_msg_list",
        _ajax_nonce: bogo_save_url.ajd_nonce,
      },
      function (response) {
        const dataList = response?.data?.categoryDataList;
        setCategoryList([
          ...categoryList?.map(listObj => {
            listObj.disabled = !!dataList?.find(catMsgObj => parseInt(catMsgObj?.id) === listObj?.value);
            return listObj;
          })
        ])
        if (category_id) {
          const targetCategory = dataList?.find(catMsgObj => catMsgObj?.id === category_id);
          setPickedCategoryObj(targetCategory);
          setCategoryId(targetCategory?.id);
          setCategoryMessage(targetCategory?.message);
        }
      }
    );
  }, []);

  const tabPanels = [
    {
      key: "categoryInfo",
      title: __("Category Information", "storegrowth-sales-booster"),
      panel: <CategoryInfo
        useParams={useParams}
        categoryId={categoryId}
        categoryList={categoryList}
        setCategoryId={setCategoryId}
        categoryMessage={categoryMessage}
        setCategoryMessage={setCategoryMessage}
      />,
    },
  ];

  return (
    <>
      <Form {...layout}>
        <PanelRow>
          <PanelSettings
            colSpan={24}
            tabPanels={tabPanels}
            activeTab={`categoryInfo`}
          />
        </PanelRow>

        <ActionsHandler
          saveHandler={onFormSave}
          resetHandler={onFormReset}
          loadingHandler={buttonLoading}
        />
      </Form>
    </>
  );
}

export default CreateMessage;
