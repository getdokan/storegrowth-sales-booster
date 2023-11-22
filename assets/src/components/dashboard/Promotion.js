import React from "react";
import PremiumBox from "./PremiumBox";
import Gaurantee from "./Gaurantee";
const Promotion = () => {
  const isPro = !sgsbAdmin?.isPro;
  const pricingPath = window.location.hash === "#/dashboard/pricing";
  return (
    <div className="sgsb-promotion-block">
      {(!pricingPath && isPro) && <PremiumBox />}
      <Gaurantee />
    </div>
  );
};

export default Promotion;
