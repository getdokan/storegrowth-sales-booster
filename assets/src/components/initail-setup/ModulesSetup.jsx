import { useDispatch, useSelect } from "@wordpress/data";
import { useEffect } from "@wordpress/element";
import ModuleList from "../modules/ModuleList";
import { Ajax } from "../../ajax";
import { __ } from "@wordpress/i18n";

function ModulesSetup() {
  const { updateModules } = useDispatch("sgsb");

  // Get from WP data.
  const { allModules } = useSelect((select) => ({
    allModules: select("sgsb").getModules(),
  }));

  useEffect(() => {
    Ajax("get_all_modules").success((response) => {
      updateModules(response);
    });
  }, []);

  return (
    <div className="site-card-wrapper sgsb-admin-dashboard">
      <div className="sgsb-admin-dashboard-module">
      <div className='ini-setup-announce-container'>
          <div className='annouce-contents'>
            <h3 className='sgsb-content-heading'>{__("Choose and Enable Modules", "storegrowth-sales-booster")}</h3>
            <span className='sgsb-sub-heading'>{__(`This is a list of all the modules of StoreGrowth. Enable your desired modules and get them ready for your next sales campaign.`, 'storegrowth-sales-booster')}</span>
          </div>
        </div>
        <ModuleList
          modules={allModules}
        />
      </div>
    </div>
  );
}

export default ModulesSetup;
