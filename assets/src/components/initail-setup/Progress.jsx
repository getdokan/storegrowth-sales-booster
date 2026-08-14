
import { Fragment } from '@wordpress/element';
import ContentLayout from './ContentLayout';

const Progress = ({ next, prev, current,stepSize, agreementData, handleCheckbox, iniSetupChecker}) => {

  return (
    <Fragment>
      <ContentLayout current={current} next={next} prev={prev} stepSize={stepSize} agreementData={agreementData} handleCheckbox={handleCheckbox} iniSetupChecker={iniSetupChecker}/>
    </Fragment>
  );
}

export default Progress
