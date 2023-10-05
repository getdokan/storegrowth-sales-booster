import React from 'react'
import { Button ,Image} from 'antd'
import crownIcon from "../../../../../images/cap-icon.svg"
const UpgradeCard = ({message}) => {
  return (
    <div className="sgsb-upgrade-premium-notice-card">
    <span className="sgsb-premium-limit-warning-message">
      {message}
    </span>
    <div className="premium-btn">
      <Button
        width="210px"
        href="https://invizo.io/support/"
        target="_blank"
        type="primary"
      >
        Upgrade to Pro
        <Image preview={false} width={22} src={crownIcon} />
      </Button>
    </div>
  </div>
  )
}

export default UpgradeCard
