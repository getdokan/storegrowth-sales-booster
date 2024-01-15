
import { useState, Fragment } from '@wordpress/element';
import { Steps } from 'antd';
import ContentLayout from './ContentLayout';

const Progress = () => {
  const [current, setCurrent] = useState(0);
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

  return (
    <Fragment>
      <Steps
        labelPlacement="vertical"
        current={current}
        onChange={onChange}
        items={steps}
      />
      <ContentLayout current={current} />
    </Fragment>
  );
}

export default Progress
