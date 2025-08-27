import { Button } from "antd";
import { __ } from "@wordpress/i18n";
import DiscountBanner from "./DiscountBanner";
import ActionsHandler from "sales-booster/src/components/settings/Panels/PanelSettings/ActionsHandler";
import {Fragment} from "react";

function SettingsTab(props) {
  const {
    isValid,
    formData,
    setFormData,
    onFieldChange,
    onFormSave,
    buttonLoading,
    onFormReset,
    setShowUndo
  } = props;


  return (
    <Fragment>
      <DiscountBanner
        isValid={isValid}
        formData={formData}
        setShowUndo={setShowUndo}
        setFormData={setFormData}
        onFieldChange={onFieldChange}
      />

      <ActionsHandler
        resetHandler={onFormReset}
        loadingHandler={buttonLoading}
        saveHandler={isValid && onFormSave}
      />
      <p className="ant-form-item-explain" style={{ margin: "15px 0 0 0" }}>
        Note: Please clear your cart in order to see the updates when you update
        these settings.
      </p>
    </Fragment>
  );
}

export default SettingsTab;
