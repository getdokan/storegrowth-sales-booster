import React, { useState, useEffect } from 'react'
import { __ } from "@wordpress/i18n";
import { CopyOutlined } from "@ant-design/icons";
import EmptyField from '../../../settings/Panels/PanelSettings/Fields/EmptyField';

const GeneratedCode = () => {

  const short_code = `[sgsb_countdown_timer title="Discount Off"  start_date="" end_date="" template=""]`;

  return (
    <>
      <EmptyField
        needUpgrade={true}
        title={__("Generated Code", "storegrowth-sales-booster-pro")}
        tooltip={__(
          "Generated Code Of the short code",
          "storegrowth-sales-booster-pro"
        )}
      >
        <div className="countdown-shortcode-content" >
          <span>{short_code}</span>
          <div className="copy-button" >
            <CopyOutlined />
          </div>
        </div>
      </EmptyField>
    </>
  )
}

export default GeneratedCode
