import React from "react";
// import './PricingToggle.css';

function PricingToggle({ isActive,handleToggle }) {
  

  return (
    <label
      htmlFor="toggle2"
      className={`toggle-switch ${isActive ? "yearly" : "lifetime"}`}
    >
      <span
        onClick={isActive ? null : handleToggle}
        className={`option ${isActive ? "active" : ""}`}
      >
        Monthly
      </span>
      <span
        onClick={!isActive ? null : handleToggle}
        className={`option ${!isActive ? "active" : ""}`}
      >
        Yearly
      </span>
    </label>
  );
}

export default PricingToggle;
