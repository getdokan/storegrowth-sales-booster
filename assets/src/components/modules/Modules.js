import { useEffect, useState } from '@wordpress/element';
import { useDispatch, useSelect } from '@wordpress/data';
import { Row, Pagination, Col} from 'antd';
import { nanoid } from 'nanoid'

import ModuleCard from './ModuleCard';
import { Ajax } from '../../ajax';
import ModuleFilter from './ModuleFilter';
import ModuleSearch from './ModuleSearch';

function Modules() {
  const options = [
    'Bangladesh', 'Africa', 'America', 'Asia', 'Europe', 'Oceania'
  ];

  const { updateModules, setPageLoading } = useDispatch( 'sgsb' );
  const [ searchModule, setSearchModule ] = useState("");
  const [selectedValue , setSelectedValue ] = useState(options[0]);

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
  const perPageItem = 5
  const [ minValue, setMinValue ] = useState(0)
  const [ maxValue, setMaxValue ] = useState(perPageItem)

  const hanglePageItem = (pageNumber) => {
    setMinValue((pageNumber -1) * perPageItem);
    setMaxValue(pageNumber  * perPageItem);
    
  };

  const handleFilterModule = (e) => {
    let value = e.target.options;
    setSelectedValue(value);
  };

  return (
    <div className="site-card-wrapper">
      <Row className='sgsb-search-section' align="middle" justify="espace-betweennd">

        <Col span={12}>
          <h1 className="sgsb-heading">Sales Booster for WooCommerce</h1>
        </Col>

        <Col span={12}>
          <Row justify="end">
            <ModuleSearch
              options={options}
              value={selectedValue}
              onChange={(e) => 
                setSearchModule(e.target.value)
              }
            />
            <ModuleFilter 
              onChange={handleFilterModule}
            />
          </Row>
        </Col>
      </Row>

      <Row gutter={16}>
        {allModules.filter((module) => module.name.toLowerCase().includes(searchModule)).slice(minValue, maxValue).map((module) => <ModuleCard module={module} key={nanoid()} />)}
        
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
