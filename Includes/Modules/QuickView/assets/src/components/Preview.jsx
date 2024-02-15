import React, { Fragment } from "react";
import { __ } from "@wordpress/i18n";
import QuickViewPreview from "./Templates/QuickViewPreview";

const Preview = ({ formData }) => {
  return (
    <QuickViewPreview formData={formData}/>
  );
};

export default Preview;
