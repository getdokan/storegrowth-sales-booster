import { DownOutlined, UpOutlined } from '@ant-design/icons';
import { useDispatch, useSelect } from '@wordpress/data';
import { useEffect, useState } from '@wordpress/element';
import { Alert, Button, Col, Pagination, Rate, Row } from 'antd';
import { nanoid } from 'nanoid';

import { Ajax } from '../../ajax';
import ModuleCard from './ModuleCard';
import ModuleSearch from './ModuleSearch';

import capIcon from '../../../images/cap-icon.svg';
import helpIcon from '../../../images/help-icon.svg';
import logo from '../../../images/logo.svg';
import premiumBoxIcon from '../../../images/premium-box-icon.svg';
import widgetIcon from '../../../images/widget-icon.svg';


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
          <img width="164" src={logo} />
        </div>
        
        <h1>
          <svg width="19" height="19" viewBox="0 0 19 19" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="8" height="8" rx="2" fill="#073B4C"/>
            <rect x="11" width="8" height="8" rx="4" fill="#073B4C"/>
            <rect y="11" width="8" height="8" rx="2" fill="#073B4C"/>
            <rect x="11" y="11" width="8" height="8" rx="2" fill="#073B4C"/>
          </svg>

          Dashboard
        </h1>
        <div className='all-widgets-menu'>
          <h4><img src={widgetIcon} width="18"/> All Widgets
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

        <div className='request__feature-block'>
          <img className='box-icon' width="70" src={premiumBoxIcon} />
          <h4>Get StoreGrowth <br/>Premium</h4>
          <p>Be the first to get new
            features & tools, before
            everyone else. Get 24/7
            support and boost your
            website’s visibility.
            </p>
            <h5>Reviews from real users</h5>
            <div className='rating'>
              <Rate disabled defaultValue={5} />
            </div>
            <Button className='premium-btn' type="primary" href='https://invizo.io/' target='_blank' size='large'>Get Premium <img width="19" src={capIcon} /></Button>
        </div>
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
                  <Button width="210px" href='https://invizo.io/contact/' target='_blank' type="primary">Need Help? <img width="22" src={helpIcon} /></Button>
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
              description="This module active first"
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
