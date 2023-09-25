import { __ } from "@wordpress/i18n";
import { Fragment } from "react";
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
        <>
          <div
            style={{
              position: "absolute",
              borderRadius: "5px",
              backgroundColor: "#0875ff",
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "flex-start",
              padding: "20px 14px",
              gap: "63px",
              textAlign: "center",
              fontSize: "16px",
              color: "#fff",
              fontFamily: "Inter",
              height: "60px",
            }}
          >
            <img
              style={{
                position: "relative",
                width: "32px",
                height: "32px",
                overflow: "hidden",
                flexShrink: "0",
              }}
              alt=""
              src="/discount-1.svg"
            />
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "flex-start",
              }}
            >
              <div
                style={{
                  position: "relative",
                  fontWeight: "600",
                  fontFamily: "Poppins",
                }}
              >
                Add more $49 to get FREE SHIPPING
              </div>
            </div>
            <img
              style={{ position: "relative", width: "16px", height: "16px" }}
              alt=""
              src="/close.svg"
            />
          </div>
        </>
      </SettingsSection>
    </>
  );
};

export default Templates;
