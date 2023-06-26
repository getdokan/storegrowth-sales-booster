import { useEffect, useState } from '@wordpress/element';
import { useDispatch, useSelect } from '@wordpress/data';
import { Row, Pagination, Col } from 'antd';
import { nanoid } from 'nanoid'

import ModuleCard from './ModuleCard';
import { Ajax } from '../../ajax';
import ModuleFilter from './ModuleFilter';
import ModuleSearch from './ModuleSearch';

function Modules() {

  const { updateModules, setPageLoading } = useDispatch( 'sgsb' );
  const [ searchModule, setSearchModule ] = useState("");
  const [selectFilter, setSelectFilter] = useState({
    modules: [],
  });

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

  // static filter category
  const CATEGORIES = [
    "Quick Cart", 
    "Discount Banner", 
    "Upsell", 
    "Stock",
    "Sales"
  ]

  useEffect(() => {
    if (allModules) {
      setSelectFilter({ modules: allModules });
    }
  }, [allModules]);

  // handle filter func
  const handleFilterChange = (event) => {
    setSelectFilter(prevState => {
      let filters = new Set(prevState.filters)
      let modules = allModules
      
      
      if (event.target.checked) {
        filters.add(event.target.value)
      } else {
        filters.delete(event.target.value)
      }
      
      if (filters.size) {
        modules = modules.filter(module => {
          return filters.has(module.category)
        })
      }
      
      return {
        filters,
        modules,
      }
    })
  }

  // Module List
  const ModuleList = ({ modules }) =>{
    console.log("---modules", {modules})
    return (
      <>
      {modules.filter((module) => module.name.toLowerCase().includes(searchModule) ).slice(minValue, maxValue).map(module => (
          <ModuleCard module={ module } key={nanoid()} />
      ))}
    </>
    )
  }

  return (
    <div className="site-card-wrapper">
      <Row className='sgsb-search-section' align="middle" justify="espace-betweennd">

        <Col span={12}>
          <h1 className="sgsb-heading">Sales Booster for WooCommerce</h1>
        </Col>

        <Col span={12}>
          <Row justify="end">
            <ModuleSearch
              onChange={(e) => 
                setSearchModule(e.target.value)
              }
            />
            <ModuleFilter 
              categories={CATEGORIES}
              onFilterChange={handleFilterChange}
            />

          </Row>
        </Col>
      </Row>

      <Row gutter={16}>

        <ModuleList modules={selectFilter.modules} />
        
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
