import { __ } from "@wordpress/i18n";
import { applyFilters } from "@wordpress/hooks";
import { useDispatch, useSelect } from "@wordpress/data";
import SectionHeader from "sales-booster/src/components/settings/Panels/SectionHeader";
import Number from "sales-booster/src/components/settings/Panels/PanelSettings/Fields/Number";
import SelectBox from "sales-booster/src/components/settings/Panels/PanelSettings/Fields/SelectBox";
import ColourPicker from "sales-booster/src/components/settings/Panels/PanelSettings/Fields/ColorPicker";
import SettingsSection from "sales-booster/src/components/settings/Panels/PanelSettings/SettingsSection";
import BogoIcons from "../BogoIcons";
import { Fragment } from "react";
import Switcher from "sales-booster/src/components/settings/Panels/PanelSettings/Fields/Switcher";

const TemplateSection = () => {
  const { setCreateFromData } = useDispatch("sgsb_bogo");

  const { createBogoData } = useSelect((select) => ({
    createBogoData: select("sgsb_bogo").getCreateFromData(),
  }));

  const onFieldChange = (key, value) => {
    setCreateFromData({
      ...createBogoData,
      [key]: key !== 'enable_custom_badge_image' ? value : ( value ? 1 : 0 ),
    });
  };

  const iconStyleNames = [
    "bogo-icons-1",
    "bogo-icons-2",
    "bogo-icons-3",
    "bogo-icons-4",
  ];

  const iconOptions = iconStyleNames?.map((iconStyleName) => ({
    key: iconStyleName,
    value: (
      <BogoIcons
        activeIcon={createBogoData?.default_badge_icon_name === iconStyleName}
        iconName={iconStyleName}
      />
    ),
  }));

  const onBarChange = (key, value) => {
    setCreateFromData({
      ...createBogoData,
      [key]: value,
      default_custom_badge_icon: "",
    });
  };

  const borders = [
    { value: "dotted", label: __("Dotted", "storegrowth-sales-booster") },
    { value: "dashed", label: __("Dashed", "storegrowth-sales-booster") },
    { value: "solid", label: __("Solid", "storegrowth-sales-booster") },
    { value: "no_border", label: __("No Border", "storegrowth-sales-booster") },
  ];

  const enable_custom_badge_image = parseInt( createBogoData.enable_custom_badge_image ) !== 0;

  return (
    <Fragment>
      <SettingsSection>
        <Switcher
          changeHandler={ onFieldChange }
          name={ 'enable_custom_badge_image' }
          isEnable={ enable_custom_badge_image }
          title={ __( 'Offer Icon', 'storegrowth-sales-booster' ) }
          tooltip={ __( 'Will be able to achieve the control of the image style in the popup.', 'storegrowth-sales-booster' ) }
        />

        {/* Rendered BOGO image style settings. */}
        { enable_custom_badge_image && (
          applyFilters(
            'sgsb_bogo_single_badge_icon_radio_box',
            '',
            iconOptions,
            createBogoData,
            onBarChange,
            setCreateFromData
          )
        ) }
      </SettingsSection>
      {/* Render bogo offer box settings section. */}
      <SectionHeader
        title={__("BOGO Offer Box", "storegrowth-sales-booster")}
      />
      <SettingsSection>
        <SelectBox
          options={[...borders]}
          name={`box_border_style`}
          changeHandler={onFieldChange}
          fieldValue={createBogoData.box_border_style}
          title={__("Overview Border", "storegrowth-sales-booster")}
          placeHolderText={__(
            "Change Overview Border",
            "storegrowth-sales-booster"
          )}
          tooltip={__(
            "The Style of the order bogo border.",
            "storegrowth-sales-booster"
          )}
        />
        <ColourPicker
          name={`box_border_color`}
          changeHandler={onFieldChange}
          fieldValue={createBogoData.box_border_color}
          title={__("Border Color", "storegrowth-sales-booster")}
          tooltip={__(
            "The color of the order bogo color.",
            "storegrowth-sales-booster"
          )}
        />
        <Number
          min={0}
          max={100}
          style={{ width: 100 }}
          name={`box_top_margin`}
          changeHandler={onFieldChange}
          fieldValue={createBogoData.box_top_margin}
          title={__("Top Margin", "storegrowth-sales-booster")}
        />
        <Number
          min={0}
          max={100}
          style={{ width: 100 }}
          name={`box_bottom_margin`}
          changeHandler={onFieldChange}
          fieldValue={createBogoData.box_bottom_margin}
          title={__("Bottom Margin", "storegrowth-sales-booster")}
        />
      </SettingsSection>

      {/* Render discount settings section. */}
      <SectionHeader
        title={__("Message Section", "storegrowth-sales-booster")}
      />
      <SettingsSection>
        <ColourPicker
          changeHandler={onFieldChange}
          name={`discount_background_color`}
          fieldValue={createBogoData.discount_background_color}
          title={__("Background Color", "storegrowth-sales-booster")}
          tooltip={__(
            "The background color of the discount heading.",
            "storegrowth-sales-booster"
          )}
        />
        <ColourPicker
          name={`discount_text_color`}
          changeHandler={onFieldChange}
          fieldValue={createBogoData.discount_text_color}
          title={__("Text Color", "storegrowth-sales-booster")}
          tooltip={__(
            "The text color of the discount text.",
            "storegrowth-sales-booster"
          )}
        />
        <Number
          min={12}
          max={25}
          style={{ width: 100 }}
          name={`discount_font_size`}
          changeHandler={onFieldChange}
          fieldValue={createBogoData.discount_font_size}
          title={__("Font Size", "storegrowth-sales-booster")}
        />
      </SettingsSection>

      {/* Render product settings section. */}
      <SectionHeader
        title={__("Product Section", "storegrowth-sales-booster")}
      />
      <SettingsSection style={{ marginBottom: 0 }}>
        <ColourPicker
          changeHandler={onFieldChange}
          name={`product_description_text_color`}
          fieldValue={createBogoData.product_description_text_color}
          title={__("Text Color", "storegrowth-sales-booster")}
          tooltip={__(
            "The text color of the product.",
            "storegrowth-sales-booster"
          )}
        />
        <Number
          min={14}
          max={22}
          style={{ width: 100 }}
          changeHandler={onFieldChange}
          name={`product_description_font_size`}
          fieldValue={createBogoData.product_description_font_size}
          title={__("Font Size", "storegrowth-sales-booster")}
        />
      </SettingsSection>
    </Fragment>
  );
};

export default TemplateSection;
