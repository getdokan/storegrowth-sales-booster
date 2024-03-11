
import { Fragment } from '@wordpress/element';
import ContentLayout from './ContentLayout';

const Progress = ({next,prev,current,setCurrent,stepSize}) => {

  return (
    <Fragment>  
      <ContentLayout current={current} next={next} prev={prev} stepSize={stepSize}/>
    </Fragment>
  );
}

export default Progress
