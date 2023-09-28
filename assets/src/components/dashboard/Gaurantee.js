import React from "react";
import { Image } from "antd";
import GaraunteeBadge from "../../../images/gaurentee-bagde.svg";
const Gaurantee = () => {
  return (
    <div className="sg_pro_btm_btm">
      <Image preview={false} width={200} src={GaraunteeBadge} />
      <h4>Without Any Question</h4>
      <h6>Terms & Condition</h6>
    </div>
  );
};

export default Gaurantee;
