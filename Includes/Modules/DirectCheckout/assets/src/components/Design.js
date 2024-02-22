import { __ } from "@wordpress/i18n";
import { Fragment } from "react";
import { useDispatch, useSelect } from "@wordpress/data";
import SettingsSection from "../../../../../../assets/src/components/settings/Panels/PanelSettings/SettingsSection";
import Number from "../../../../../../assets/src/components/settings/Panels/PanelSettings/Fields/Number";
import ColourPicker from "../../../../../../assets/src/components/settings/Panels/PanelSettings/Fields/ColorPicker";
import ActionsHandler from "sales-booster/src/components/settings/Panels/PanelSettings/ActionsHandler";
import { createDirectCheckoutForm } from "../helper";
import Switcher from "sales-booster/src/components/settings/Panels/PanelSettings/Fields/Switcher";
import { applyFilters } from "@wordpress/hooks";

function Design({ onFormSave, upgradeTeaser }) {
  const { setCreateFromData } = useDispatch("sgsb_direct_checkout");

  const { createDirectCheckoutFormData, getButtonLoading } = useSelect(
    (select) => ({
      createDirectCheckoutFormData: select(
        "sgsb_direct_checkout"
      ).getCreateFromData(),
      getButtonLoading: select("sgsb_direct_checkout").getButtonLoading(),
    })
  );

  const onFormReset = () => {
    setCreateFromData({ ...createDirectCheckoutForm });
  };

  const onFieldChange = (key, value) => {
    setCreateFromData({
      ...createDirectCheckoutFormData,
      [key]: value,
    });
  };

  return (
    <Fragment>
      <SettingsSection>
        <Switcher
          name={ 'button_style' }
          changeHandler={ onFieldChange }
          isEnable={ Boolean( createDirectCheckoutFormData.button_style ) }
          title={ __( 'Button Style', 'storegrowth-sales-booster' ) }
          tooltip={ __( 'Will be able to achieve the control of the button style in the product.', 'storegrowth-sales-booster' ) }
        />

        { Boolean( createDirectCheckoutFormData.button_style ) && (
          <Fragment>
            <ColourPicker
              name={"button_color"}
              fieldValue={createDirectCheckoutFormData.button_color}
              changeHandler={onFieldChange}
              title={__("Button Color", "storegrowth-sales-booster")}
            />

            <ColourPicker
              name={"text_color"}
              fieldValue={createDirectCheckoutFormData.text_color}
              changeHandler={onFieldChange}
              title={__("Text Color", "storegrowth-sales-booster")}
            />

            <Number
              min={1}
              max={100}
              addonAfter={"px"}
              style={{
                width: "100px",
                textAlign: "center",
              }}
              name={`font_size`}
              fieldValue={createDirectCheckoutFormData.font_size}
              changeHandler={onFieldChange}
              title={__("Font Size", "storegrowth-sales-booster")}
              placeHolderText={__("Font Size", "storegrowth-sales-booster")}
              tooltip={__(
                "To set the size of the font",
                "storegrowth-sales-booster"
              )}
            />

            <Number
              min={1}
              max={100}
              style={{
                width: "100px",
                textAlign: "center",
              }}
              addonAfter={"px"}
              name={"button_border_radius"}
              fieldValue={createDirectCheckoutFormData.button_border_radius}
              changeHandler={onFieldChange}
              title={__("Border Radius", "storegrowth-sales-booster")}
              placeHolderText={__("Border Radius", "storegrowth-sales-booster")}
              tooltip={__(
                "To set the border radius of the button",
                "storegrowth-sales-booster"
              )}
            />

            { applyFilters(
              "sgsb_after_direct_checkout_button_design_settings",
              "",
              createDirectCheckoutFormData,
              onFieldChange,
            ) }
          </Fragment>
        ) }
      </SettingsSection>

      <ActionsHandler
        resetHandler={onFormReset}
        loadingHandler={getButtonLoading}
        saveHandler={() => onFormSave("design")}
      />
    </Fragment>
  );
}

export default Design;
