import { useEffect } from '@wordpress/element';
import { useDispatch, useSelect } from '@wordpress/data';
import { Row } from 'antd';
import { nanoid } from 'nanoid'

import ModuleCard from './ModuleCard';
import { Ajax } from '../../ajax';
import ModulePaginaton from './ModulePagination';

function Modules() {
  const { updateModules, setPageLoading } = useDispatch( 'sgsb' );

  useEffect(() => {
    setPageLoading(true);
    Ajax( 'get_all_modules' ).success((response) => {
      // Update to WP data.
      updateModules(response);
      setPageLoading(false);
    });
  }, []);

  // Get from WP data.
  const { allModules } = useSelect((select) => ({
    allModules: select('sgsb').getModules()
  }));

  return (
    <div className="site-card-wrapper">
      <Row gutter={16}>
		    {console.log(allModules)}
        {allModules.map((module) => <ModuleCard module={module} key={nanoid()} />)}
        

      </Row>
      <div className='sgsb__module-pagination'
        style={{
          paddingTop: '30px'
        }}
      >
        <ModulePaginaton />
      </div>
    </div>
  );
}

export default Modules;
