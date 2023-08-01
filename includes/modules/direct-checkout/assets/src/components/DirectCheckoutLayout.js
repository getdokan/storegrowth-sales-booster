import { Tabs, notification } from "antd";
import General from "./General";
import Design from "./Design";
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

  const items = [
    {
      key: "general",
      label: "General",
      children: <General onFormSave={onFormSave} />,
    },
    {
      key: "design",
      label: "Design",
      children: <Design onFormSave={onFormSave}/>,
    },
  ];


  return (
    <>
      <Tabs activeKey={tabName ? tabName : "general"} onTabClick={changeTab}>
      {items.map((item) => (
          <TabPane tab={item.label} key={item.key}>
            {item.children}
          </TabPane>
        ))}
      </Tabs>
    </>
  );
}

export default DirectCheckoutLayout;
