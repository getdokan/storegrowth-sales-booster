import { __ } from "@wordpress/i18n";
import DefaultBanner from "./DefaultBanner";
import ActionsHandler from "sales-booster/src/components/settings/Panels/PanelSettings/ActionsHandler";
function SettingsTab(props) {
  const {
    formData,
    setFormData,
    onFieldChange,
    onFormSave,
    buttonLoading,
    upgradeTeaser,
    onFormReset,
  } = props;

  return (
    <>
      <DefaultBanner
        formData={formData}
        setFormData={setFormData}
        onFieldChange={onFieldChange}
        upgradeTeaser={upgradeTeaser}
      />
      <ActionsHandler
        resetHandler={onFormReset}
        loadingHandler={buttonLoading}
        saveHandler={onFormSave}
      />

      <p className="ant-form-item-explain" style={{ margin: "15px 0 0 0" }}>
        Note: Please clear your cart in order to see the updates when you update
        these settings.
      </p>
    </>
  );
}

export default SettingsTab;
