import { __ } from "@wordpress/i18n";
import SectionHeader from "../../../../../../assets/src/components/settings/Panels/SectionHeader";
import SettingsSection from "../../../../../../assets/src/components/settings/Panels/PanelSettings/SettingsSection";

const Templates = ({
  formData,
  onFieldChange,
  onFormSave,
  buttonLoading,
  upgradeTeaser,
  fontFamily,
  textTitle,
}) => {
  const noop = () => {};

  return (
    <>
      <SectionHeader title={textTitle} />
      <SettingsSection>


      </SettingsSection>
    </>
  );
};

export default Templates;
