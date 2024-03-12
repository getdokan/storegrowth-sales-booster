
import { Fragment } from '@wordpress/element';
import ContentLayout from './ContentLayout';

const Progress = ({ next, prev, current, setCurrent, stepSize, agreementData, handleCheckbox ,getUserDetails}) => {

  return (
    <Fragment>
      <ContentLayout current={current} next={next} prev={prev} stepSize={stepSize} agreementData={agreementData} handleCheckbox={handleCheckbox} getUserDetails={getUserDetails}/>
    </Fragment>
  );
}

export default Progress
