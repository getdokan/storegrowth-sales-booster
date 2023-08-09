import { DownOutlined, UpOutlined } from '@ant-design/icons';
import { useDispatch, useSelect } from '@wordpress/data';
import { useEffect, useState } from '@wordpress/element';
import { Alert, Button, Col, Image, Pagination, Row } from 'antd';
import { nanoid } from 'nanoid';

import { Ajax } from '../../ajax';
import ModuleCard from './ModuleCard';
import ModuleSearch from './ModuleSearch';

import dashboardIcon from '../../../images/dashboard-icon.svg';
import helpIcon from '../../../images/help-icon.svg';
import logo from '../../../images/logo.svg';
import widgetIcon from '../../../images/widget-icon.svg';
import PremiumBox from './PremiumBox';


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
  const perPageItem = 6
  const [ minValue, setMinValue ] = useState(0)
  const [ maxValue, setMaxValue ] = useState(perPageItem)

  const hanglePageItem = (pageNumber) => {
    setMinValue((pageNumber -1) * perPageItem);
    setMaxValue(pageNumber  * perPageItem);
    
  };

  // static filter category
  // const CATEGORIES = [
  //   "Quick Cart", 
  //   "Discount Banner", 
  //   "Upsell", 
  //   "Stock",
  //   "Sales"
  // ]

  useEffect(() => {
    if (allModules) {
      setSelectFilter({ modules: allModules });
    }
  }, [allModules]);

  // handle filter func
  // const handleFilterChange = (event) => {
  //   setSelectFilter(prevState => {
  //     let filters = new Set(prevState.filters)
  //     let modules = allModules
      
      
  //     if (event.target.checked) {
  //       filters.add(event.target.value)
  //     } else {
  //       filters.delete(event.target.value)
  //     }
      
  //     if (filters.size) {
  //       modules = modules.filter(module => {
  //         return filters.has(module.category)
  //       })
  //     }
      
  //     return {
  //       filters,
  //       modules,
  //     }
  //   })
  // }

  // Module List
  const ModuleList = ({ modules }) =>{
    return (
      <>
      {modules.filter((module) => module.name.toLowerCase().includes(searchModule) ).slice(minValue, maxValue).map(module => (
          <ModuleCard module={ module } key={nanoid()} />
      ))}
    </>
    )
  }

  const onChange = (checked) => {
    console.log(`switch to ${checked}`);
  };

  const [ activeModule, setActiveModule ] = useState(false)
  const [ activeClass, setActiveClass ] = useState(false)

  const handleActiveModule = () => {
    setActiveModule(true)
    setTimeout(() => {
      setActiveModule(false)
    }, 4000)
  }

  const toggleMenuClass = () => {
    setActiveClass( ( prevIsActive ) => !prevIsActive );
    
  }

  return (
    <div className="site-card-wrapper sgsb-admin-dashboard">
      <div className='sgsb-admin-dashboard-sideabr'>
        <div className="sgsb-logo">
          <Image
            preview={false}
            width={164}
            src={logo}
          />
        </div>
        
        <h3>
          <Image
            preview={false}
            width={19}
            src={dashboardIcon}
          />
          Dashboard
        </h3>
        <div className='all-widgets-menu'>
          <h4>
            <Image
              preview={false}
              width={18}
              src={widgetIcon}
            />
            All Widgets
            <span onClick={toggleMenuClass} className="ant-menu-title-content">
              {
                activeClass ? <DownOutlined /> : <UpOutlined />
              }
            </span>
          </h4>
          <ul className={ activeClass ? 'widgets-menu ant-menu-hidden' : 'widgets-menu' }>
            {
              allModules.map((module) => {
                return(
                  !module.status ? <li className={module.id} onClick={ handleActiveModule }>{module.name}</li> : <li className={module.id}><a href={ `admin.php?page=sgsb-settings#/${module.id} `}>{module.name}</a></li>
                )
              })
            }
          </ul>
        </div>

        {/* <li className='active-widgets'>Active Widgets <Switch onChange={onChange} defaultChecked /></li> */}
            
        <PremiumBox />
        
      </div>
      <div className='sgsb-admin-dashboard-module'>
        <div className='sgsb-admin-dashboard-module-top-bar'>
          <Row className='sgsb-search-section' align="middle" justify="espace-betweennd">
            <Col span={24}>
              <Row justify="end">
                <ModuleSearch
                  onChange={(e) => 
                    setSearchModule(e.target.value)
                  }
                />
                <div className='help-btn'>
                  <Button width="210px" href='https://invizo.io/support/' target='_blank' type="primary">
                    Need Help? 
                    <Image
                      preview={false}
                      width={22}
                      src={helpIcon}
                    />
                  </Button>
                </div>
                {/* <ModuleFilter 
                  categories={CATEGORIES}
                  onFilterChange={handleFilterChange}
                /> */}

              </Row>
            </Col>
          </Row>
        </div>

        {
          activeModule && (
            <Alert
              description="This module is not active. Please active first to view settings"
              type="warning"
              showIcon
              closable
            />
          )
        }

        <Row gutter={16} className='sgsb-admin-dashboard-module-box-content'>

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
    </div>
  );
}

export default Modules;
