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
import downArrowIocn from '../../../images/menu/down-arrow-icon.svg';
import upArrowIocn from '../../../images/menu/up-arrow-icon.svg';
import widgetIcon from '../../../images/widget-icon.svg';
import ModuleFilter from './ModuleFilter';
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

  useEffect(() => {
    if (allModules) {
      setSelectFilter({ modules: allModules });
    }
  }, [allModules]);

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

  // handle active module of settings url
  const [ activeModule, setActiveModule ] = useState(false)
  const [ activeClass, setActiveClass ] = useState(false)

  const handleActiveModule = () => {
    setActiveModule(true)
    setTimeout(() => {
      setActiveModule(false)
    }, 4000)
  }

  // handle active class
  const toggleMenuClass = () => {
    setActiveClass( ( prevIsActive ) => !prevIsActive );
    
  }

  // handle module filter of active
  const handleActiveModuleFilter = (event) => {

    setSelectFilter((prevState) =>{
      let filters = new Set(prevState.filters)
      let modules = allModules

      event == true ? filters.add(event) : filters.delete(event);

      if ( filters.size ) {
        modules = modules.filter(module => {
          return filters.has(module.status)

        })
      }

      return {
        modules,
      }

    })

  };

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
                activeClass ? <img src={upArrowIocn} width="12" /> : <img src={downArrowIocn} width="12" />
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

        <ModuleFilter onFilterChange={handleActiveModuleFilter} />
        
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
                  onFilterChange={handleActiveModuleFilter}
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

        <Row className='sgsb-admin-dashboard-module-box-content'>

          <ModuleList modules={selectFilter.modules} />

        </Row>

        <div className='sgsb__module-pagination'
          style={{
            paddingTop: '80px',
            paddingLeft: '22px'
            
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
