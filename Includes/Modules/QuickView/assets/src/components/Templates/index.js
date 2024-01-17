import { Fragment } from "react";
import { __ } from "@wordpress/i18n";
import QuickViewOne from "./QuickViewOne";
import { applyFilters } from "@wordpress/hooks";
import SectionHeader from "sales-booster/src/components/settings/Panels/SectionHeader";
import SettingsSection from "sales-booster/src/components/settings/Panels/PanelSettings/SettingsSection";
import RadioTemplate from "sales-booster/src/components/settings/Panels/PanelSettings/Fields/RadioTemplate";
import QuickViewTwo from "./QuickViewTwo";
import QuickViewThree from "./QuickViewThree";

const Templates = ({ formData, setFormData }) => {
  let templates = [
    {
      key: "quick_view_one",
      component: (
        <QuickViewOne
          activeTemplate={formData?.stockbar_template === "quick_view_one"}
        />
      ),
    },
    {
      key: "quick_view_two",
      component: (
        <QuickViewTwo
          activeTemplate={formData?.stockbar_template === "quick_view_two"}
        />
      ),
    },
    {
      key: "quick_view_three",
      component: (
        <QuickViewThree
          activeTemplate={formData?.stockbar_template === "quick_view_three"}
        />
      ),
    },
  ];

  const templateStyles = {
    quick_view_one: {
      stockbar_height: 10,
      stockbar_bg_color: "#EBF6FF",
      stockbar_fg_color: "#008DFF",
      stockbar_template: "quick_view_one",
      stock_display_format: "above",
      stockbar_border_color: "#DDE6F9",
      total_sell_count_text: __("Total Sold", "storegrowth-sales-booster"),
      available_item_count_text: __(
        "Available Item",
        "storegrowth-sales-booster"
      ),
    },
    quick_view_two: {
      stockbar_height: 10,
      stockbar_bg_color: "#E6F8F1",
      stockbar_fg_color: "#02AC6E",
      stockbar_template: "quick_view_two",
      stock_display_format: "above",
      stockbar_border_color: "#BDE5D7",
      total_sell_count_text: __("Total Sold", "storegrowth-sales-booster"),
      available_item_count_text: __(
        "Available Item",
        "storegrowth-sales-booster"
      ),
    },
    quick_view_three: {
      stockbar_height: 10,
      stockbar_bg_color: "#EFF0F8",
      stockbar_fg_color: "linear-gradient(90deg, #AF89FF 0%, #0283AC 100%)",
      stockbar_template: "quick_view_three",
      stock_display_format: "above",
      stockbar_border_color: "#ae89ff33",
      total_sell_count_text: __("Total Sold", "storegrowth-sales-booster"),
      available_item_count_text: __(
        "Available Item",
        "storegrowth-sales-booster"
      ),
    },
  };

  // List of shipping bar templates.
  templates = applyFilters("sgsb_shipping_bar_templates", templates);

  const onTemplateChange = (name, value) => {
    setFormData({
      ...formData,
      ...templateStyles?.[value],
    });
  };

  return (
    <Fragment>
      <SectionHeader title={__("Template", "storegrowth-sales-booster")} />
      <SettingsSection>
        <RadioTemplate
          options={templates}
          name={`stockbar_template`}
          classes={`quick-view-templates`}
          changeHandler={onTemplateChange}
          fieldValue={formData?.stockbar_template}
        />
      </SettingsSection>
    </Fragment>
  );
};

export default Templates;
