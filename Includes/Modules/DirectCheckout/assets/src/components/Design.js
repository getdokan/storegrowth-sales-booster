import { __ } from "@wordpress/i18n";
import { Fragment } from "react";
import { useDispatch, useSelect } from "@wordpress/data";
import SettingsSection from "../../../../../../assets/src/components/settings/Panels/PanelSettings/SettingsSection";
import Number from "../../../../../../assets/src/components/settings/Panels/PanelSettings/Fields/Number";
import ColourPicker from "../../../../../../assets/src/components/settings/Panels/PanelSettings/Fields/ColorPicker";
import ActionsHandler from "sales-booster/src/components/settings/Panels/PanelSettings/ActionsHandler";
import { createDirectCheckoutForm } from "../helper";
import Switcher from "sales-booster/src/components/settings/Panels/PanelSettings/Fields/Switcher";
import {SelectBox} from "sales-booster/src/components/settings/Panels";

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

  const fontFamily = [
    {
      value: 'poppins',
      label: __('Poppins', 'storegrowth-sales-booster'),
    },
    {
      value: 'roboto',
      label: __('Roboto', 'storegrowth-sales-booster'),
    },
    {
      value: 'lato',
      label: __('Lato', 'storegrowth-sales-booster'),
    },
    {
      value: 'montserrat',
      label: __('Montserrat', 'storegrowth-sales-booster'),
    },
    {
      value: 'ibm_plex_sans',
      label: __('IBM Plex Sans', 'storegrowth-sales-booster'),
    },
  ];

  const borders = [
    { value: 'dotted', label: __( 'Dotted', 'storegrowth-sales-booster' ) },
    { value: 'dashed', label: __( 'Dashed', 'storegrowth-sales-booster' ) },
    { value: 'solid', label: __( 'Solid', 'storegrowth-sales-booster' ) },
    { value: 'no_border', label: __( 'No Border', 'storegrowth-sales-booster' ) },
  ];

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

        <SelectBox
          name={ `font_family` }
          options={ [ ...fontFamily ] }
          fieldValue={ createDirectCheckoutFormData.font_family }
          changeHandler={ onFieldChange }
          title={ __( "Font Family", "storegrowth-sales-booster" ) }
          tooltip={ __(
            "Select your desired font family",
            "storegrowth-sales-booster"
          ) }
        />

        <Number
          min={1}
          max={100}
          style={{
            width: "100px",
            textAlign: "center",
          }}
          addonAfter={"px"}
          name={"paddingXaxis"}
          fieldValue={createDirectCheckoutFormData.paddingXaxis}
          changeHandler={onFieldChange}
          title={__("Horizontal Padding", "storegrowth-sales-booster")}
          placeHolderText={__("Button Horizontal Padding", "storegrowth-sales-booster")}
          tooltip={__(
            "To set the horizontal padding of the button",
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
          name={"paddingYaxis"}
          fieldValue={createDirectCheckoutFormData.paddingYaxis}
          changeHandler={onFieldChange}
          title={__("Vertical Padding", "storegrowth-sales-booster")}
          placeHolderText={__("Button Vertical Padding", "storegrowth-sales-booster")}
          tooltip={__(
            "To set the vertical padding of the button",
            "storegrowth-sales-booster"
          )}
        />

        <SelectBox
          options={ [ ...borders ] }
          name={ `button_border_style` }
          changeHandler={ onFieldChange }
          fieldValue={ createDirectCheckoutFormData.button_border_style }
          title={ __( 'Overview Border', 'storegrowth-sales-booster' ) }
          placeHolderText={ __( 'Change Overview Border', 'storegrowth-sales-booster' ) }
          tooltip={ __( 'The Style of the order bump border.', 'storegrowth-sales-booster' ) }
        />

        <ColourPicker
          name={"border_color"}
          fieldValue={createDirectCheckoutFormData.border_color}
          changeHandler={onFieldChange}
          title={__("Border Color", "storegrowth-sales-booster")}
        />

        <Number
          min={1}
          max={20}
          style={{
            width: "100px",
            textAlign: "center",
          }}
          addonAfter={"px"}
          name={"border_width"}
          fieldValue={createDirectCheckoutFormData.border_width}
          changeHandler={onFieldChange}
          title={__("Border Width", "storegrowth-sales-booster")}
          placeHolderText={__("Button Border Width", "storegrowth-sales-booster")}
          tooltip={__(
            "To set the border width of the button",
            "storegrowth-sales-booster"
          )}
        />

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
