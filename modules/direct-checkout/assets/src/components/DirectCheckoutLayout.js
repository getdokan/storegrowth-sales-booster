import { __ } from "@wordpress/i18n";
import { notification } from "antd";
import General from "./General";
import Design from "./Design";
import Preview from "./Preview";
import { useDispatch, useSelect } from "@wordpress/data";

import PanelHeader from "../../../../../../assets/src/components/settings/Panels/PanelHeader";
import PanelContainer from "../../../../../../assets/src/components/settings/Panels/PanelContainer";
import PanelRow from "../../../../../../assets/src/components/settings/Panels/PanelRow";
import PanelPreview from "../../../../../../assets/src/components/settings/Panels/PanelPreview";
import PanelSettings from "../../../../../../assets/src/components/settings/Panels/PanelSettings";
import TouchPreview from "sales-booster/src/components/settings/Panels/TouchPreview";

function DirectCheckoutLayout({
  outlet: Outlet,
  navigate,
  useSearchParams,
  moduleId,
}) {
  const isProEnabled = sgsbAdmin.isPro;

  const { setCreateFromData, setButtonLoading } = useDispatch(
    "sgsb_direct_checkout"
  );
  let [searchParams, setSearchParams] = useSearchParams("general");
  const tabName = searchParams.get("tab_name") || "general";
  const { createDirectCheckoutForm } = useSelect((select) => ({
    createDirectCheckoutForm: select(
      "sgsb_direct_checkout"
    ).getCreateFromData(),
  }));

  const changeTab = (key) => {
    navigate("/direct-checkout?tab_name=" + key);
  };

  const notificationMessage = (type) => {
    if (type == "general_settings") {
      notification["success"]({
        message: "General Settings Section",
        description: "General section settings data updated successfully.",
      });
    }

    if (type == "design") {
      notification["success"]({
        message: "Design Section",
        description: "Design section data updated successfully.",
      });
    }
  };

  const onFormSave = (type) => {
    setButtonLoading(true);

    jQuery.post(
      sgsbAdmin.ajax_url,
      {
        action: "sgsb_direct_checkout_save_settings",
        data: JSON.stringify({
          direct_checkout_data: createDirectCheckoutForm,
        }),
        _ajax_nonce: sgsbAdmin.nonce,
      },
      function (response) {
        setCreateFromData(response.data);
        setButtonLoading(false);
        notificationMessage(type);
      }
    );
  };

  const excludeTabs = [];
  const showPreview = !excludeTabs?.includes(tabName);

  const tabPanels = [
    {
      key: "general",
      title: __("Checkout Setting", "storegrowth-sales-booster"),
      panel: <General onFormSave={onFormSave} upgradeTeaser={!isProEnabled} />,
    },
    {
      key: "design",
      title: __("Design", "storegrowth-sales-booster"),
      panel: <Design onFormSave={onFormSave} upgradeTeaser={!isProEnabled} />,
    },
  ];

  return (
    <>
      <PanelHeader
        title={__("Direct Checkout Setting", "storegrowth-sales-booster")}
        moduleId={moduleId}
      />
      <PanelContainer>
        <PanelRow>
          <PanelSettings
            colSpan={showPreview && tabName ? 14 : 24}
            tabPanels={tabPanels}
            changeHandler={changeTab}
            activeTab={tabName}
          />
          {showPreview && tabName && (
            <PanelPreview colSpan={10}>
              <Preview storeData={createDirectCheckoutForm} />
            </PanelPreview>
          )}
        </PanelRow>
        {/* Render preview panel for responsive preview. */}
        <TouchPreview previewWidth={250}>
          <Preview storeData={createDirectCheckoutForm} />
        </TouchPreview>
      </PanelContainer>
    </>
  );
}

export default DirectCheckoutLayout;
