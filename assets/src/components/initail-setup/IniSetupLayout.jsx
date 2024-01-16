import { React, Fragment, useState, useRef, useEffect } from '@wordpress/element';
import Progress from './Progress';
import { Button } from 'antd';
import StoreGrowthIcon from '../../../images/logo.svg'

const IniSetupLayout = () => {
  const [current, setCurrent] = useState(0);
  const contentLayoutRef = useRef(null);

  const clickHandler = () => { window.location.href = 'admin.php?page=sgsb-settings#/dashboard/overview' };

  const next = () => { setCurrent(current + 1) }

  const prev = () => {
    setCurrent(current - 1);
  };

  useEffect(() => {

    // Scroll to the top of the content layout when 'current' changes
    if (current !== 0) {
      if (contentLayoutRef.current) {
        contentLayoutRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [current]);

  return (
    <Fragment>
      <div ref={contentLayoutRef} className='sgsb-ini-setup-page'>
        <div className='storegrowth-icon'>
          <img src={StoreGrowthIcon} alt="storegrowth-icon" />
        </div>
        <div className='sgsg-ini-setup-progress'> <Progress next={next} prev={prev} current={current} setCurrent={setCurrent} /></div>

        <div className='sgsb-return-dashboard'>
          <Button className="sgsb-dashboard-cta" onClick={clickHandler}> Return To Dashboard</Button>
        </div>
      </div>
    </Fragment>
  )

}

export default IniSetupLayout;
