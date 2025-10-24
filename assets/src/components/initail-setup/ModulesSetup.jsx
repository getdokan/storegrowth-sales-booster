import { useDispatch, useSelect } from "@wordpress/data";
import { useEffect } from "@wordpress/element";
import ModuleList from "../modules/ModuleList";
import { Ajax } from "../../ajax";
import { __ } from "@wordpress/i18n";

function ModulesSetup() {
  const { updateModules } = useDispatch("spsg");

  // Get from WP data.
  const { allModules } = useSelect((select) => ({
    allModules: select("spsg").getModules(),
  }));

  useEffect(() => {
    Ajax("get_all_modules").then((response) => {
      updateModules(response);
    });
  }, []);

  return (
    <div className="site-card-wrapper spsg-admin-dashboard">
      <div className="spsg-admin-dashboard-module">
      <div className='ini-setup-announce-container'>
          <div className='annouce-contents'>
            <h3 className='spsg-content-heading'>{__("Choose and Enable Modules", "storegrowth-sales-booster")}</h3>
            <span className='spsg-sub-heading'>{__(`This is a list of all the modules of StoreGrowth. Enable your desired modules and get them ready for your next sales campaign.`, 'storegrowth-sales-booster')}</span>
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
