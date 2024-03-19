
import { Fragment } from '@wordpress/element';
import ContentLayout from './ContentLayout';

const Progress = ({ next, prev, current,stepSize, agreementData, handleCheckbox ,getUserDetails, iniSetupChecker}) => {

  return (
    <Fragment>
      <ContentLayout current={current} next={next} prev={prev} stepSize={stepSize} agreementData={agreementData} handleCheckbox={handleCheckbox} getUserDetails={getUserDetails} iniSetupChecker={iniSetupChecker}/>
    </Fragment>
  );
}

export default Progress
