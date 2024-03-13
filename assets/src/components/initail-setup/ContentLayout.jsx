import { useEffect, useRef } from '@wordpress/element';
import { __ } from "@wordpress/i18n";
import Welcome from './Welcome';
import ModulesSetup from './ModulesSetup';
import Ready from './Ready';

const ContentLayout = ({ current, next, prev, stepSize = 0, agreementData, handleCheckbox, getUserDetails, iniSetupChecker }) => {


  const renderContent = () => {
    switch (parseInt(current)) {
      case 0:
        return <Welcome current={current} next={next} agreementData={agreementData} handleCheckbox={handleCheckbox} getUserDetails={getUserDetails} />;
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
      {(current !== 0) &&
        <div className='sgsb-steps-controller'>
          <button onClick={prev} type="button" className='steps-button previous'>{__(`Previous`, 'storegrowth-sales-booster')}</button>
          {current !== 2 && <button onClick={next} type="button" className='steps-button next'>{__(`Next Step`, 'storegrowth-sales-booster')}</button>}
          {current === 2 &&
            <a
              href="/wp-admin/admin.php?page=sgsb-settings#dashboard/overview"
              className="steps-button completion-cta"
              onClick={() => iniSetupChecker()}
            >
              {__(`Go to dashboard`, "storegrowth-sales-booster")}
            </a>
          }

        </div>
      }
    </div>
  );
}

export default ContentLayout;
