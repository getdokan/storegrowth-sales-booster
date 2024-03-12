
import { Fragment } from '@wordpress/element';
import ContentLayout from './ContentLayout';

const Progress = ({ next, prev, current, setCurrent, stepSize, agreementData, handleCheckbox }) => {

  return (
    <Fragment>
      <ContentLayout current={current} next={next} prev={prev} stepSize={stepSize} agreementData={agreementData} handleCheckbox={handleCheckbox} />
    </Fragment>
  );
}

export default Progress
