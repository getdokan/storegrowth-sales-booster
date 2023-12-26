import { __ } from "@wordpress/i18n";
import { Form } from "antd";
import PanelRow from "sales-booster/src/components/settings/Panels/PanelRow";
import PanelSettings from "sales-booster/src/components/settings/Panels/PanelSettings";
import BogoList from "./BogoList";
import GeneralSettings from "./GeneralSettings";

function BogoTabLayout({ navigate, useSearchParams }) {

  const changeTab = (key) => {
    navigate("/bogo?tab_name=" + key);
  };

  const layout = {
    labelCol: {
      span: 8,
    },
    wrapperCol: {
      span: 15,
    },
  };

  const [searchParams, setSearchParams] = useSearchParams();
  const tabName = searchParams.get("tab_name");

  const tabPanels = [
    {
      key: "general",
      title: __("General", "storegrowth-sales-booster"),
      panel: <GeneralSettings />,
    },
    {
      key: "lists",
      title: __("Lists", "storegrowth-sales-booster"),
      panel: <BogoList navigate={navigate} />,
    },
  ];

  return (
    <>
      <Form {...layout}>
        <PanelRow>
          <PanelSettings
            colSpan={24}
            tabPanels={tabPanels}
            changeHandler={changeTab}
            activeTab={tabName ? tabName : "general"}
          />
        </PanelRow>
      </Form>
    </>
  );
}

export default BogoTabLayout;
