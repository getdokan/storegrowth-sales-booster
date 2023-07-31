import { Tabs, notification } from "antd";
import General from "./General";
const { TabPane } = Tabs;
import { useDispatch, useSelect } from "@wordpress/data";

function DirectCheckoutLayout({ outlet: Outlet, navigate, useSearchParams }) {
  const { setCreateFromData, setButtonLoading } = useDispatch(
    "sgsb_direct_checkout"
  );
  let [searchParams, setSearchParams] = useSearchParams();

  const tabName = searchParams.get("tab_name");
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
    console.log(sgsbAdmin.ajax_url);

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

  return (
    <>
      <Tabs activeKey={tabName ? tabName : "general"} onTabClick={changeTab}>
        <TabPane tab="General" key="general">
          <General onFormSave={onFormSave} />
        </TabPane>

        <TabPane tab="Design" key="design">
          "Design"
        </TabPane>
      </Tabs>
    </>
  );
}

export default DirectCheckoutLayout;
