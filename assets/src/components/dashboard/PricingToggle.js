import React from "react";
// import './PricingToggle.css';

function PricingToggle({ isActive,handleToggle,toggleContent }) {
  

  return (
    <label
      htmlFor="toggle2"
      className={`toggle-switch ${isActive ? "yearly" : "lifetime"}`}
    >
      <span
        onClick={isActive ? null : handleToggle}
        className={`option ${isActive ? "active" : ""}`}
      >
        {toggleContent?.leftContent}
      </span>
      <span
        onClick={!isActive ? null : handleToggle}
        className={`option ${!isActive ? "active" : ""}`}
      >
        {toggleContent?.rightContent}
      </span>
    </label>
  );
}

export default PricingToggle;
