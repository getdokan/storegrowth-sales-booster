import { __ } from "@wordpress/i18n";
import { addFilter } from "@wordpress/hooks";
import { Switcher } from "../settings/Panels";
import InputNumber from "../settings/Panels/PanelSettings/Fields/Number";
import SettingsSection from "../settings/Panels/PanelSettings/SettingsSection";
import TextAreaBox from "../settings/Panels/PanelSettings/Fields/TextAreaBox";
import SingleCheckBox from "../settings/Panels/PanelSettings/Fields/SingleCheckBox";
import ColourPicker from "../settings/Panels/PanelSettings/Fields/ColorPicker";
import SelectBox from "../settings/Panels/PanelSettings/Fields/SelectBox";
import TextInput from "../settings/Panels/PanelSettings/Fields/TextInput";

const noop = () => {};

// Handle sales pop Modules pro settings prompts.
addFilter(
  "sgsb_after_sales_pop_enable_settings",
  "sgsb_after_sales_pop_enable_settings_callback",
  (component) => {
    return (
      <Switcher
        colSpan={12}
        isEnable={false}
        needUpgrade={true}
        name={"mobile_view"}
        changeHandler={noop}
        title={__("Popup in Mobile", "storegrowth-sales-booster-pro")}
        tooltip={__(
          "By enabling the pop up will be visible in the mobile devices.",
          "storegrowth-sales-booster-pro"
        )}
      />
    );
  }
);
addFilter(
  "sgsb_sales_pop_message_panel_settings",
  "sgsb_sales_pop_message_panel_settings_callback",
  (component) => {
    return (
      <SettingsSection>
        <TextAreaBox
          areaRows={4}
          needUpgrade={true}
          changeHandler={noop}
          name={"message_popup"}
          renderTextAreaContent={true}
          fieldValue={`virtual_name}\n{product_title}\nFrom {location}\n{time}`}
          title={__("Message Popup", "storegrowth-sales-booster-pro")}
          placeHolderText={__(
            "Enter Message Popup",
            "storegrowth-sales-booster-pro"
          )}
          tooltip={__(
            "The base message template that is to be shown in the sales pop.",
            "storegrowth-sales-booster-pro"
          )}
        />
      </SettingsSection>
    );
  }
);
addFilter(
  "sgsb_sales_pop_time_panel_settings",
  "sgsb_sales_pop_time_panel_settings_callback",
  () => {
    return (
      <SettingsSection>
        <Switcher
          name={"loop"}
          colSpan={12}
          isEnable={false}
          needUpgrade={true}
          changeHandler={noop}
          title={__("Loop", "storegrowth-sales-booster-pro")}
          tooltip={__(
            "The product source will loop around in the sales pop.",
            "storegrowth-sales-booster-pro"
          )}
        />
        <InputNumber
          min={1}
          colSpan={12}
          fieldValue={5}
          needUpgrade={true}
          changeHandler={noop}
          name={"next_time_display"}
          title={__("Next Time Display", "storegrowth-sales-booster-pro")}
          placeHolderText={__(
            "Enter Next Time Display",
            "storegrowth-sales-booster-pro"
          )}
          tooltip={__(
            "Time to start next notification(in seconds)",
            "storegrowth-sales-booster-pro"
          )}
        />
        <InputNumber
          min={1}
          colSpan={12}
          fieldValue={5}
          needUpgrade={true}
          changeHandler={noop}
          name={"notification_per_page"}
          title={__("Notification Per Page", "storegrowth-sales-booster-pro")}
          tooltip={__(
            "Quantity Notifications Per Page",
            "storegrowth-sales-booster-pro"
          )}
          placeHolderText={__(
            "Enter Notification Per Page",
            "storegrowth-sales-booster-pro"
          )}
        />
        <InputNumber
          min={1}
          colSpan={12}
          fieldValue={5}
          needUpgrade={true}
          changeHandler={noop}
          name={"initial_time_delay"}
          title={__("Initial Time Delay", "storegrowth-sales-booster-pro")}
          placeHolderText={__(
            "Enter Initial Time Delay",
            "storegrowth-sales-booster-pro"
          )}
          tooltip={__(
            "When Your Site Load, Notification will wait this time to show(in seconds)",
            "storegrowth-sales-booster-pro"
          )}
        />
        <InputNumber
          min={1}
          colSpan={12}
          fieldValue={5}
          needUpgrade={true}
          changeHandler={noop}
          name={"dispaly_time"}
          title={__("Display Time", "storegrowth-sales-booster-pro")}
          placeHolderText={__(
            "Enter Virtual Time",
            "storegrowth-sales-booster-pro"
          )}
          tooltip={__(
            "Time your notification display",
            "storegrowth-sales-booster-pro"
          )}
        />
      </SettingsSection>
    );
  }
);

// Handle stock bar modules pro settings prompts.
addFilter(
  "sgsb_shop_stock_bar_enable_settings",
  "sgsb_shop_stock_bar_enable_settings_callback",
  (component) => {
    return (
      <SingleCheckBox
        needUpgrade={true}
        name={"shop_page_stock_bar_enable"}
        checkedValue={false}
        className={`settings-field checkbox-field`}
        changeHandler={noop}
        title={__("Display on Shop Page", "storegrowth-sales-booster")}
        tooltip={__(
          "The stock countdown bar will show on the shop page",
          "storegrowth-sales-booster"
        )}
      />
    );
  }
);
addFilter(
  "sgsb_variation_product_stock_bar_enable_settings",
  "sgsb_variation_product_stock_bar_enable_settings_callback",
  (component) => {
    return (
      <SingleCheckBox
        needUpgrade={true}
        name={"variation_page_stock_bar_enable"}
        checkedValue={false}
        className={`settings-field checkbox-field`}
        changeHandler={noop}
        title={__(
          "Display on Variation Product Page",
          "storegrowth-sales-booster"
        )}
        tooltip={__(
          "The stock countdown bar will show on the variations product page",
          "storegrowth-sales-booster"
        )}
      />
    );
  }
);
addFilter(
  "sgsb_bar_color_stock_bar_settings",
  "sgsb_bar_color_stock_bar_settings_callback",
  (component) => {
    return (
      <ColourPicker
        needUpgrade={true}
        name={"stockbar_fg_color"}
        fieldValue={"008DFF"}
        changeHandler={noop}
        title={__("Bar Color", "storegrowth-sales-booster")}
      />
    );
  }
);
addFilter(
  "sgsb_design_panel_stock_bar_settings",
  "sgsb_design_panel_stock_bar_settings_callback",
  (component) => {
    const barDisplayFormat = [
      {
        value: "above",
        label: __("Above Stock Bar", "storegrowth-sales-booster"),
      },
    ];

    return (
      <>
        <InputNumber
          min={1}
          max={100}
          style={{
            width: "100px",
          }}
          name={`stockbar_height`}
          changeHandler={noop}
          fieldValue={10}
          needUpgrade={true}
          title={__(`Stock Bar Height`, "storegrowth-sales-booster")}
        />

        <SelectBox
          needUpgrade={true}
          name={`stock_display_format`}
          options={[...barDisplayFormat]}
          fieldValue={"above"}
          changeHandler={noop}
          title={__("Stock Display Format", "storegrowth-sales-booster")}
          tooltip={__(
            "Select your desired font family",
            "storegrowth-sales-booster"
          )}
        />

        <TextInput
          name={"total_sell_count_text"}
          placeHolderText={__(
            "Last chance! [discount]% OFF",
            "storegrowth-sales-booster"
          )}
          fieldValue={__("Total Sold", "storegrowth-sales-booster")}
          className={`settings-field input-field`}
          changeHandler={noop}
          title={__("Total Sell Count Text", "storegrowth-sales-booster")}
          tooltip={__(
            "It will be placed left side of the above of the Stock Bar. e.g. Total Sold",
            "storegrowth-sales-booster"
          )}
          needUpgrade={true}
        />
        <TextInput
          name={"available_item_count_text"}
          placeHolderText={__(
            "Last chance! [discount]% OFF",
            "storegrowth-sales-booster"
          )}
          fieldValue={__("Available Item", "storegrowth-sales-booster")}
          className={`settings-field input-field`}
          changeHandler={noop}
          title={__("Available Item Count Text", "storegrowth-sales-booster")}
          tooltip={__(
            "It will be placed right side of the above of the Stock Bar. e.g. Available Item",
            "storegrowth-sales-booster"
          )}
          needUpgrade={true}
        />
      </>
    );
  }
);
