import { useEffect, useRef } from '@wordpress/element';
import { __ } from "@wordpress/i18n";
import Welcome from './Welcome';
import ModulesSetup from './ModulesSetup';
import Ready from './Ready';

const ContentLayout = ({ current, next, prev, stepSize = 0 }) => {


  const renderContent = () => {
    switch (parseInt(current)) {
      case 0:
        return <Welcome current={current} next={next} />;
      case 1:
        return <ModulesSetup />;
      case 2:
        return <Ready />;
      default:
        return null;
    }
  };

  return (
    <div className='sgsb-ini-setup-content-layout'>
      {renderContent()}
      {(current !== 0 && current !== stepSize - 1) &&
        <div className='sgsb-steps-controller'>
          <button onClick={prev} type="button" className='steps-button previous'>{__(`Previous`, 'storegrowth-sales-booster')}</button>
          <button onClick={next} type="button" className='steps-button next'>{__(`Next`, 'storegrowth-sales-booster')}</button>
        </div>
      }
    </div>
  );
}

export default ContentLayout;
