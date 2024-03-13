import { useDispatch, useSelect } from "@wordpress/data";
import { useEffect, useState} from "@wordpress/element";
import { Pagination } from "antd";
import ModuleList from "../modules/ModuleList";
import { Ajax } from "../../ajax";
import { __ } from "@wordpress/i18n";

function ModulesSetup() {

  const perPageItem = 6;

  const [pagination, setPagination] = useState({
    minValue: 0,
    maxValue: perPageItem,
    selectFilter: { modules: [] },
    currentPage: 1,
  });

  const { updateModules } = useDispatch("sgsb");

  // Get from WP data.
  const { allModules } = useSelect((select) => ({
    allModules: select("sgsb").getModules(),
  }));

  const hanglePageItem = (pageNumber) => {
    // Pagination calculation based on all Modules (preserves the current page)
    const startIndex = (pageNumber - 1) * perPageItem;
    const endIndex = startIndex + perPageItem;

    setPagination({
      ...pagination,
      minValue: startIndex,
      maxValue: endIndex,
      currentPage: pageNumber,
    });
  };

  useEffect(() => {
    if (allModules) {
      setPagination({
        ...pagination,
        selectFilter: { modules: allModules },
      });
    }
  }, [allModules]);

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
          minValue={pagination?.minValue}
          maxValue={pagination?.maxValue}
        />
        <div
          className="sgsb__module-pagination"
          style={{
            paddingLeft: "22px",
          }}
        >
          <Pagination
            defaultCurrent={1}
            current={pagination?.currentPage}
            defaultPageSize={perPageItem}
            onChange={hanglePageItem}
            total={allModules?.length}
            hideOnSinglePage={false}
          />
        </div>
      </div>
    </div>
  );
}

export default ModulesSetup;
