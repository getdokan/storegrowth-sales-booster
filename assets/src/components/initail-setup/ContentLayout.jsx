import React from 'react'
import Welcome from './Welcome';
import ModulesSetup from './ModulesSetup';
import Ready from './Ready';

const ContentLayout = ({ current }) => {

  const renderContent = () => {
    switch (current) {
      case 0:
        return <Welcome />;
      case 1:
        return <ModulesSetup />;
      case 2:
        return <Ready />;
      default:
        return null;
    }
  };

  return (
    <div className='sgsb-ini-setup-content-layout'>{renderContent()}</div>
  )
}

export default ContentLayout
