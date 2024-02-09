import { Fragment } from "react";
import { useState, useEffect } from "@wordpress/element";
import { writeText } from "clipboard-polyfill";
import { CopyOutlined, CopyFilled } from "@ant-design/icons";
import { __ } from "@wordpress/i18n";
import SettingsSection from "sales-booster/src/components/settings/Panels/PanelSettings/SettingsSection";
import TextInput from "sales-booster/src/components/settings/Panels/PanelSettings/Fields/TextInput";
import EmptyField from "sales-booster/src/components/settings/Panels/PanelSettings/Fields/EmptyField";

import "../styles/countdown-timer.css";
import Templates from "./Templates";
import Countdown from "./Countdown";

function ShortCodeGenerator() {
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    let timer;
    if (copied) {
      timer = setTimeout(() => {
        setCopied(false);
      }, 3000);
    }
    return () => {
      clearTimeout(timer);
    };
  }, [copied]);

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
  const short_code = `[sgsb_countdown_timer title="${formData.countdown_heading}"  start_date="${formData.countdown_start_date}" end_date="${formData.countdown_end_date}" template="${formData.selected_theme}"]`;
  const handleCopyText = () => {
    writeText(short_code)
      .then(() => setCopied(true))
      .catch((error) => console.error("Error copying text: ", error));
  };

  return (
    <Fragment>
      <SettingsSection>
        <EmptyField
          title={__("Generated Code", "storegrowth-sales-booster-pro")}
          tooltip={__("Actions of the button", "storegrowth-sales-booster-pro")}
        >
          <div className="countdown-shortcode-content" n>
            <span>{short_code}</span>
            <div className="copy-button" onClick={handleCopyText}>
              {copied ? <CopyFilled /> : <CopyOutlined />}
            </div>
          </div>
        </EmptyField>
        <TextInput
          name={"countdown_heading"}
          placeHolderText={__(
            "Last chance! [discount]% OFF",
            "storegrowth-sales-booster"
          )}
          fieldValue={formData.countdown_heading}
          className={`settings-field input-field`}
          changeHandler={onFieldChange}
          title={__("Countdown Heading", "storegrowth-sales-booster")}
          tooltip={__(
            "The [discount] will be replace with your actual discount percentage. e.g. Last chance! [discount]% OFF",
            "storegrowth-sales-booster"
          )}
        />

        <Countdown formData={formData} onFieldChange={onFieldChange} />
      </SettingsSection>

      <Templates formData={formData} setFormData={setFormData} />
    </Fragment>
  );
}

export default ShortCodeGenerator;
