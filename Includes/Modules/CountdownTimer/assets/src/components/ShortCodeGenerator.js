import { Fragment } from "react";
import { useState } from "@wordpress/element";
import { applyFilters } from "@wordpress/hooks";
import { __ } from "@wordpress/i18n";
import SettingsSection from "sales-booster/src/components/settings/Panels/PanelSettings/SettingsSection";
import "../styles/countdown-timer.css";
import Templates from "./Templates";

function ShortCodeGenerator({ formData, setFormData,onFieldChange }) {

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
