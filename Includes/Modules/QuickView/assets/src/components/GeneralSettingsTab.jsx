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
      value: "mfp-3d-unfold",
      label: __("3D Unfold", "storegrowth-sales-booster"),
    },
    {
      value: "mfp-zoom-out",
      label: __("Zoom Out", "storegrowth-sales-booster"),
    },
    {
      value: "mfp-move-from-top",
      label: __("Move From Top", "storegrowth-sales-booster"),
    },
    {
      value: "mfp-fade",
      label: __("Fade", "storegrowth-sales-booster"),
    },
  ];

  let contentOptions = [
    {
      name: "show_title",
      title: __("Show Title", "storegrowth-sales-booster"),
    },
    {
      name: "show_description",
      title: __("Show Description", "storegrowth-sales-booster"),
    },
    {
      name: "show_price",
      title: __("Show Price", "storegrowth-sales-booster"),
    },
    {
      name: "show_image",
      title: __("Show Product Image", "storegrowth-sales-booster"),
    },
    {
      name: "show_excert",
      title: __("Show Excert", "storegrowth-sales-booster"),
    },
    {
      name: "show_meta",
      title: __("Show Product Meta", "storegrowth-sales-booster"),
    },
    {
      name: "show_add_to_cart",
      title: __("Show Add to Cart", "storegrowth-sales-booster"),
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
          title={__("Popup Contents:", "storegrowth-sales-booster")}
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
