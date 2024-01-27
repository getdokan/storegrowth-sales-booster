import { Fragment } from "react";
import { __ } from "@wordpress/i18n";
import { applyFilters } from "@wordpress/hooks";
import SettingsSection from "sales-booster/src/components/settings/Panels/PanelSettings/SettingsSection";
import SingleCheckBox from "sales-booster/src/components/settings/Panels/PanelSettings/Fields/SingleCheckBox";
import ActionsHandler from "sales-booster/src/components/settings/Panels/PanelSettings/ActionsHandler";
import Switcher from "sales-booster/src/components/settings/Panels/PanelSettings/Fields/Switcher";
import SelectBox from "sales-booster/src/components/settings/Panels/PanelSettings/Fields/SelectBox";
import TextInput from "sales-booster/src/components/settings/Panels/PanelSettings/Fields/TextInput";
import ContentGroup from "./ContentGroup";

function GeneralSettingsTab(props) {
  const { formData, onFieldChange, onFormSave, buttonLoading, onFormReset } =
    props;

  const modalEffects = [
    {
      value: "normal",
      label: __("Normal", "storegrowth-sales-booster"),
    },
    {
      value: "sticky",
      label: __("Sticky", "storegrowth-sales-booster"),
    },
  ];

  let contentOptions = [
    {
      name  : "show_title",
      title : __("Show Title", "storegrowth-sales-booster"),
    },
    {
      name  : "show_description",
      title : __("Show Description", "storegrowth-sales-booster"),
    },
    {
      name  : "show_price",
      title : __("Show Price", "storegrowth-sales-booster"),
    },
    {
      name  : "show_image",
      title : __("Show Product Image", "storegrowth-sales-booster"),
    },
    {
      name  : "show_excert",
      title : __("Show Excert", "storegrowth-sales-booster"),
    },
    {
      name  : "show_meta",
      title : __("Show Product Meta", "storegrowth-sales-booster"),
    },
    {
      name  : "show_add_to_cart",
      title : __("Show Add to Cart", "storegrowth-sales-booster"),
    },
  ];

  return (
    <Fragment>
      <SettingsSection>
        {applyFilters(
          "sgsb_shop_quick_view_enable_settings",
          "",
          formData,
          onFieldChange
        )}
        <Switcher
          colSpan={12}
          name={"popup_on_mobile"}
          changeHandler={onFieldChange}
          title={__("Enable In Mobile", "storegrowth-sales-booster")}
          isEnable={
            formData?.popup_on_mobile == "true" ||
            formData?.popup_on_mobile == true
              ? true
              : false
          }
          tooltip={__(
            "By enableing this quick view will show in mobile.",
            "storegrowth-sales-booster"
          )}
        />
        <Switcher
          colSpan={12}
          name={"enable_lightbox"}
          changeHandler={onFieldChange}
          title={__("Enable LightBox", "storegrowth-sales-booster")}
          isEnable={
            formData?.enable_lightbox == "true" ||
            formData?.enable_lightbox == true
              ? true
              : false
          }
          tooltip={__(
            "By enableing this lightbox will be enabled.",
            "storegrowth-sales-booster"
          )}
        />
        <SelectBox
          name={`modal_animation_effect`}
          options={[...modalEffects]}
          fieldValue={formData?.modal_animation_effect}
          changeHandler={onFieldChange}
          title={__("Modal Effects", "storegrowth-sales-booster")}
        />
        <ContentGroup
          formData={formData}
          changeHandler={onFieldChange}
          options={[...contentOptions]}
          title={__("Cart Contents:", "storegrowth-sales-booster")}
        />
        <TextInput
          name={"button_label"}
          className={`settings-field input-field`}
          fieldValue={formData?.button_label}
          title={__("Quick View Button label", "storegrowth-sales-booster")}
          placeHolderText={__(
            "Quick View Button Label",
            "storegrowth-sales-booster"
          )}
          tooltip={__(
            "This will be the set the Label of the Quick View Button",
            "storegrowth-sales-booster"
          )}
        />
        <SingleCheckBox
          name={"product_page_quick_view_enable"}
          checkedValue={formData?.product_page_quick_view_enable}
          className={`settings-field checkbox-field`}
          changeHandler={onFieldChange}
          title={__("Display on Product Page", "storegrowth-sales-booster")}
          tooltip={__(
            "The stock countdown bar will show on the single product page",
            "storegrowth-sales-booster"
          )}
        />
        {applyFilters(
          "sgsb_variation_product_quick_view_enable_settings",
          "",
          formData,
          onFieldChange
        )}
        <ActionsHandler
          resetHandler={onFormReset}
          loadingHandler={buttonLoading}
          saveHandler={onFormSave}
        />
      </SettingsSection>
    </Fragment>
  );
}

export default GeneralSettingsTab;
