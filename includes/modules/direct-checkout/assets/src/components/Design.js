import { Button } from "antd";
import { __ } from "@wordpress/i18n";
import { Fragment } from "react";
import { useDispatch, useSelect } from "@wordpress/data";
import SettingsSection from "../../../../../../assets/src/components/settings/Panels/PanelSettings/SettingsSection";
import Number from "../../../../../../assets/src/components/settings/Panels/PanelSettings/Fields/Number";
import ColourPicker from "../../../../../../assets/src/components/settings/Panels/PanelSettings/Fields/ColorPicker";

function Design({ onFormSave, upgradeTeaser }) {
  const { setCreateFromData } = useDispatch("sgsb_direct_checkout");

  const { createDirectCheckoutForm, getButtonLoading } = useSelect(
    (select) => ({
      createDirectCheckoutForm: select(
        "sgsb_direct_checkout"
      ).getCreateFromData(),
      getButtonLoading: select("sgsb_direct_checkout").getButtonLoading(),
    })
  );

  const onFieldChange = (key, value) => {
    setCreateFromData({
      ...createDirectCheckoutForm,
      [key]: value,
    });
  };

  return (
    <Fragment>
      <SettingsSection>
        <ColourPicker
          name={"button_color"}
          fieldValue={createDirectCheckoutForm.button_color}
          changeHandler={onFieldChange}
          title={__("Button Color", "storegrowth-sales-booster")}
        />

        <ColourPicker
          name={"text_color"}
          fieldValue={createDirectCheckoutForm.text_color}
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
          fieldValue={createDirectCheckoutForm.font_size}
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
          fieldValue={createDirectCheckoutForm.button_border_radius}
          changeHandler={onFieldChange}
          title={__("Border Radius", "storegrowth-sales-booster")}
          placeHolderText={__("Border Radius", "storegrowth-sales-booster")}
          tooltip={__(
            "To set the border radius of the button",
            "storegrowth-sales-booster"
          )}
        />
      </SettingsSection>

      <Button
        type="primary"
        onClick={() => onFormSave("general_settings")}
        className="sgsb-settings-save-button"
        loading={getButtonLoading}
      >
        Save
      </Button>
    </Fragment>
  );
}

export default Design;
