import { React, Fragment } from '@wordpress/element';
import Progress from './Progress';
import {Button} from 'antd';
import StoreGrowthIcon from '../../../images/logo.svg'

const IniSetupLayout = () => {

  const clickHandler=() => { window.location.href = 'admin.php?page=sgsb-settings#/dashboard/overview'};

  return (
    <Fragment>
      <div className='sgsb-ini-setup-page'>
        <div className='storegrowth-icon'>
          <img src={StoreGrowthIcon} alt="storegrowth-icon" />
        </div>
        <div className='sgsg-ini-setup-progress'> <Progress /></div>
       
        <div className='sgsb-return-dashboard'>
          <Button className="sgsb-dashboard-cta" onClick={clickHandler}> Return To Dashboard</Button>
        </div>
      </div>
    </Fragment>
  )

}

export default IniSetupLayout;
