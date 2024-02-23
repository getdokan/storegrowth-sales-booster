import { Fragment } from "react";
import { useState } from "@wordpress/element";
import { applyFilters } from "@wordpress/hooks";
import { __ } from "@wordpress/i18n";
import SettingsSection from "sales-booster/src/components/settings/Panels/PanelSettings/SettingsSection";
import "../styles/countdown-timer.css";
import Templates from "./Templates";

function ShortCodeGenerator() {

  const countFormData = {
    countdown_heading: "Discount Off",
    countdown_start_date: "",
    countdown_end_date: "",
    selected_theme: "ct-layout-1",
  };
  const [formData, setFormData] = useState({
    ...countFormData,
  });

  const onFieldChange = (key, value) => {
    setFormData({ ...formData, [key]: value });
  };

  return (
    <Fragment>
      <SettingsSection>
      {applyFilters(
          "sgsb_ct_short_code_generator_settings",
          "",
          formData,
          onFieldChange,
        )}
        
      </SettingsSection>

      <Templates formData={formData} setFormData={setFormData} />
    </Fragment>
  );
}

export default ShortCodeGenerator;
