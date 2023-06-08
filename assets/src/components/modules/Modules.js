import { useEffect, useState } from '@wordpress/element';
import { useDispatch, useSelect } from '@wordpress/data';
import { Row, Pagination } from 'antd';
import { nanoid } from 'nanoid'

import ModuleCard from './ModuleCard';
import { Ajax } from '../../ajax';

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

  // pagination
  const perPageItem = 3
  const [ minValue, setMinValue ] = useState(0)
  const [ maxValue, setMaxValue ] = useState(perPageItem)

  const hanglePageItem = (pageNumber) => {
    setMinValue((pageNumber -1) * perPageItem);
    setMaxValue(pageNumber  * perPageItem);
    
  };

  return (
    <div className="site-card-wrapper">

      <Row gutter={16}>
        {allModules.slice(minValue, maxValue).map((module) => <ModuleCard module={module} key={nanoid()} />)}
        
      </Row>

      <div className='sgsb__module-pagination'
        style={{
          paddingTop: '30px'
        }}
      >
        {
          (allModules.length) > perPageItem && (
            <Pagination
              defaultCurrent={1}
              defaultPageSize={perPageItem}
              onChange={ hanglePageItem }
              total={allModules.length}
            />
          )
        }
        
      </div>

    </div>
  );
}

export default Modules;
