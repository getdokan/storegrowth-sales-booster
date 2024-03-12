import { React, Fragment, useState, useRef, useEffect } from '@wordpress/element';
import Progress from './Progress';
import { Steps } from 'antd';
import StoreGrowthIcon from '../../../images/logo.svg'

const IniSetupLayout = () => {
  const [current, setCurrent] = useState(0);
  const contentLayoutRef = useRef(null);

  // const clickHandler = () => { window.location.href = 'admin.php?page=sgsb-settings#/dashboard/overview' };

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

  const onChange = (value) => {
    setCurrent(value);
  };


  const steps = [
    {
      title: 'Welcome',
    },
    {
      title: 'Modules',
    },
    {
      title: 'Ready',
    },
  ];
  const stepSize = steps.length;
  return (
    <Fragment>
      <div ref={contentLayoutRef} className='sgsb-ini-setup-page'>
        <div className='sgsb-ini-page-container'>
          <div className='storegrowth-icon'>
            <img src={StoreGrowthIcon} alt="storegrowth-icon" />
            <Steps
              size="small"
              current={current}
              onChange={onChange}
              items={steps}
            />
            <div className='steps-skipper-controller'>

            </div>
          </div>
          <div className='sgsg-ini-setup-progress'> <Progress next={next} prev={prev} current={current} setCurrent={setCurrent} stepSize={stepSize} /></div>

        </div>
      </div>
    </Fragment>
  )

}

export default IniSetupLayout;
