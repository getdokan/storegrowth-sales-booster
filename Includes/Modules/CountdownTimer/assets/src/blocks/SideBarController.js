import { __ } from "@wordpress/i18n";
import  { InspectorControls } from '@wordpress/blockEditor';
import { PanelBody, TextControl } from "@wordpress/components";
import SalesDate from "./SalesDate";
import ColourPicker from "sales-booster/src/components/settings/Panels/PanelSettings/Fields/ColorPicker";

const SideBarController = ({ attributes, onFieldChange }) => {

  return (
    <>
      <InspectorControls>
        <PanelBody title={__("Countdown Timer Settings")}>
          <TextControl
            label={__("Discount Text")}
            value={attributes?.discountText}
            onChange={(value) => onFieldChange("discountText", value)}
          />
          <SalesDate attributes={attributes} onFieldChange={onFieldChange} />
        </PanelBody>
        <PanelBody title={__("Countdown Design", "storegrowth-sales-booster")}>
          <ColourPicker
            name={"headingColor"}
            fieldValue={attributes?.headingColor}
            changeHandler={onFieldChange}
            title={__("Heading Color", "storegrowth-sales-booster")}
          />
          <ColourPicker
            name={"backgroundColor"}
            fieldValue={attributes?.backgroundColor}
            changeHandler={onFieldChange}
            title={__("Background Color", "storegrowth-sales-booster")}
          />
          <ColourPicker
            name={"borderColor"}
            fieldValue={attributes?.borderColor}
            changeHandler={onFieldChange}
            title={__("Border Color", "storegrowth-sales-booster")}
          />
        </PanelBody>
      </InspectorControls>
    </>
  );
};

export default SideBarController;
