import React from "react";
import PremiumBox from "./PremiumBox";
import Gaurantee from "./Gaurantee";
const Promotion = () => {
  const pricingPath = window.location.hash === "#/dashboard/pricing";
  return (
    <div className="sgsb-promotion-block">
      {!pricingPath && <PremiumBox />}
      <Gaurantee />
    </div>
  );
};

export default Promotion;
