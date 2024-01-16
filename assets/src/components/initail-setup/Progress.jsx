
import { Fragment } from '@wordpress/element';
import { Steps } from 'antd';
import ContentLayout from './ContentLayout';

const Progress = ({next,prev,current,setCurrent}) => {
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
      <Steps
        labelPlacement="vertical"
        current={current}
        onChange={onChange}
        items={steps}
      />
      <ContentLayout current={current} next={next} prev={prev} stepSize={stepSize}/>
    </Fragment>
  );
}

export default Progress
