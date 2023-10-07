import { Form, Select, Input, Checkbox } from "antd";
import { RemovableIconPicker } from "./RemovableIconPicker";
import { Fragment } from "react";
import { __ } from "@wordpress/i18n";
import TextAreaBox from "../../../../../../assets/src/components/settings/Panels/PanelSettings/Fields/TextAreaBox";
import CheckboxGroup from "../../../../../../assets/src/components/settings/Panels/PanelSettings/Fields/CheckboxGroup";
import SelectBox from "../../../../../../assets/src/components/settings/Panels/PanelSettings/Fields/SelectBox";
import TextInput from "../../../../../../assets/src/components/settings/Panels/PanelSettings/Fields/TextInput";
import EmptyField from "../../../../../../assets/src/components/settings/Panels/PanelSettings/Fields/EmptyField";
import SettingsSection from "../../../../../../assets/src/components/settings/Panels/PanelSettings/SettingsSection";
import DisplayRules from "./DisplayRules";
import Countdown from "./Countdown";
import CuponCode from "./CuponCode";
import UpgradeCrown from "sales-booster/src/components/settings/Panels/PanelSettings/UpgradeCrown";
import RadioBox from "sales-booster/src/components/settings/Panels/PanelSettings/Fields/RadioBox";
import {wpMedia} from "sales-booster/src/utils/helper";
import BarIcon from "./BarIcon";

function DefaultBanner(props) {
  const { formData, setFormData, onFieldChange, onIconChange, upgradeTeaser } = props;
  const noop = () => {};
  const buttonActionOptions = [
    { value: "ba-url-redirect", label: "Url Redirect" },
    { value: "ba-close", label: "Banner Close" },
  ];
  const checkboxesOption = [
    {
      label: `Desktop`,
      value: "button-desktop-enable",
      tooltip: __("", "storegrowth-sales-booster"),
    },
    {
      label: `Mobile`,
      value: "button-mobile-enable",
      tooltip: __("", "storegrowth-sales-booster"),
    },
  ];

  const barPositions = [
    {
      value: "top",
      label: __("Top", "storegrowth-sales-booster"),
    },
    {
      value: "bottom",
      label: __("Bottom", "storegrowth-sales-booster"),
    },
  ];
  const barTypes = [
    {
      value: "normal",
      label: __("Normal", "storegrowth-sales-booster"),
    },
    {
      value: "sticky",
      label: __("Sticky", "storegrowth-sales-booster"),
    },
  ];

    const iconStyleNames = [
      'notify-bar-icon-1',
      'notify-bar-icon-2',
      'notify-bar-icon-3',
    ];

    const iconOptions = iconStyleNames?.map( iconStyleName => (
      { key: iconStyleName, value: <BarIcon activeIcon={ formData?.default_banner_icon_name === iconStyleName } iconName={ iconStyleName } /> }
    ) );

    const handleMediaUpload = () => {
      wpMedia( {
        fileType: 'image',
        selectMultiple: false,
        callback: handleAttachmentData,
      } );
    };

    const handleAttachmentData = ( media ) => {
      if ( !Boolean( media?.url ) ) return;

      setFormData({
        ...formData,
        default_banner_icon_name   : '',
        default_banner_custom_icon : media?.url,
      });
    };

    const handleSelectionRemove = () => {
      setFormData({
        ...formData,
        default_banner_custom_icon : '',
        default_banner_icon_name   : iconStyleNames?.[0],
      });
    };

  return (
    <Fragment>
      <SettingsSection>
        <SelectBox
          needUpgrade={upgradeTeaser}
          name={`bar_position`}
          options={[...barPositions]}
          fieldValue={formData.bar_position}
          changeHandler={upgradeTeaser ? noop : onFieldChange}
          title={__("Bar Position", "storegrowth-sales-booster")}
        />
        <SelectBox
          name={`bar_type`}
          options={[...barTypes]}
          fieldValue={formData.bar_type}
          changeHandler={onFieldChange}
          title={__("Bar Type", "storegrowth-sales-booster")}
        />
        <TextAreaBox
          areaRows={3}
          colSpan={24}
          name={"default_banner_text"}
          fieldValue={formData.default_banner_text}
          changeHandler={onFieldChange}
          title={__("Default Banner Text", "storegrowth-sales-booster")}
          placeHolderText={__(
            `Shop more than ${sgsbAdmin.currencySymbol}100 to get free shipping.`,
            "storegrowth-sales-booster"
          )}
        />
        <RadioBox
          uploadOption={ true }
          options={ [ ...iconOptions ] }
          changeHandler={ onFieldChange }
          uploadHandler={ handleMediaUpload }
          name={ `default_banner_icon_name` }
          iconRemoveHandler={ handleSelectionRemove }
          fieldValue={ formData.default_banner_icon_name }
          customValue={ formData.default_banner_custom_icon }
          title={ __( `Banner Icon`, 'storegrowth-sales-booster' ) }
        />
        <CheckboxGroup
          displayDirection={"horizontal"}
          name={"button_view"}
          options={checkboxesOption}
          selectedOptions={formData.button_view}
          handleCheckboxChange={onFieldChange}
          title={__("Show Button", "storegrowth-sales-booster")}
          headColSpan={16}
          checkboxColSpan={8}
        />
        <TextInput
          name={"ac_button_text"}
          placeHolderText={__("Button Text Here", "storegrowth-sales-booster")}
          fieldValue={formData.ac_button_text}
          className={`settings-field input-field`}
          changeHandler={onFieldChange}
          title={__("Button Text", "storegrowth-sales-booster")}
        />
        <EmptyField
          title={__("Button Action", "storegrowth-sales-booster")}
          tooltip={__("Actions of the button", "storegrowth-sales-booster")}
          colSpan={24}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "10px",
            }}
          >
            <Select
              defaultValue={formData.button_action}
              options={buttonActionOptions}
              onChange={(event) => onFieldChange("button_action", event)}
            />
            {formData.button_action === "ba-url-redirect" && (
              <>
                <Input
                  value={formData.redirect_url}
                  style={{
                    padding: "5px",
                    border: "1px solid #DDE6F9",
                  }}
                  onChange={(event) =>
                    onFieldChange("redirect_url", event.target.value)
                  }
                  placeholder="http://example.com"
                />
                <Checkbox
                  disabled={upgradeTeaser}
                  value={"new_tab_enable"}
                  checked={formData.new_tab_enable}
                  onChange={
                    upgradeTeaser
                      ? noop
                      : (event) =>
                          onFieldChange("new_tab_enable", event.target.checked)
                  }
                >
                  <div style={{ display: "flex", gap: "10px" }}>
                    Open in New Tab
                    {upgradeTeaser && <UpgradeCrown />}
                  </div>
                </Checkbox>
              </>
            )}
          </div>
        </EmptyField>
        <Countdown
          upgradeTeaser={upgradeTeaser}
          onFieldChange={onFieldChange}
          formData={formData}
          noop={noop}
        />
        <CuponCode
          upgradeTeaser={upgradeTeaser}
          formData={formData}
          onFieldChange={onFieldChange}
          noop={noop}
        />
      </SettingsSection>

      <DisplayRules
        upgradeTeaser={upgradeTeaser}
        onFieldChange={onFieldChange}
        formData={formData}
        textTitle="Display Rules"
      />

      {/*<Form>*/}
      {/*  <Form.Item label="Default Banner Icon" labelAlign="left">*/}
      {/*    <RemovableIconPicker*/}
      {/*      onClear={(v) =>*/}
      {/*        onIconChange(*/}
      {/*          "default_banner_icon_name",*/}
      {/*          "default_banner_icon_html",*/}
      {/*          ""*/}
      {/*        )*/}
      {/*      }*/}
      {/*      onChange={(v) =>*/}
      {/*        onIconChange(*/}
      {/*          "default_banner_icon_name",*/}
      {/*          "default_banner_icon_html",*/}
      {/*          v*/}
      {/*        )*/}
      {/*      }*/}
      {/*      value={formData.default_banner_icon_name}*/}
      {/*    />*/}
      {/*  </Form.Item>*/}
      {/*</Form>*/}
    </Fragment>
  );
}

export default DefaultBanner;
