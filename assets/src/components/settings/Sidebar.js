import { useEffect, useState } from '@wordpress/element';
import { Layout, Menu, Image } from 'antd';
import { Link, matchRoutes, Navigate, useLocation } from 'react-router-dom';

import logo from '../../../images/logo.svg';
import downArrowIocn from '../../../images/menu/down-arrow-icon.svg';
import upArrowIocn from '../../../images/menu/up-arrow-icon.svg';
import widgetIcon from '../../../images/widget-icon.svg';
import { __ } from '@wordpress/i18n';

function Sidebar({ routes }) {

  // let sidebarItems = applyFilters('sidebar_menu_items', [], Link);
  let firstItem = routes[0] || false;
  const location = useLocation();
  const [activeClass, setActiveClass] = useState(false);
  const matchResult = matchRoutes(routes, location);
  const currentRoute = matchResult ? matchResult[0].route : null;
  const [selectedMenu, setSelectedMenu] = useState(currentRoute?.name);

  const toggleMenuClass = () => {
    setActiveClass((prevIsActive) => !prevIsActive);
  };

  useEffect(() => {
    setSelectedMenu(currentRoute?.name);
  }, [currentRoute?.name]);

  const handleLiClick = (routeName) => {
    setSelectedMenu(routeName);
    const linkElement = document.querySelector(
      `a[data-route-name='${routeName}']`
    );
    if (linkElement) {
      linkElement.click();
    }
  };

  // Redirect to the first menu if it is the index page.
  if (location.pathname === '/' && firstItem) {
    return <Navigate to={`${firstItem.path}`} replace={true} />;
  }

  return (
    <Layout.Sider
      className='site-layout-background sgsb__settings-sidebar'
      style={{
        minHeight: '100vh',
      }}
    >
      <div className='sgsb-admin-setting-dashboard-sideabr'>
        <div className='sgsb-logo'>
          <Image preview={false} width={164} src={logo} />
        </div>

        <h3 className={ `${ selectedMenu === 'dashboard' ? 'active-menu' : '' }` }>
          <Link
            to={ `/dashboard` }
            data-route-name={ `dashboard` }
            className={ selectedMenu === 'dashboard' ? 'sgsb-selected-link' : '' }
          >
            {/*<Image preview={ false } width={ 19 } src={ dashboardIcon } />*/}
            <svg width='19' height='19' viewBox='0 0 19 19' fill='none'>
              <rect width='8' height='8' rx='2' fill={ selectedMenu === 'dashboard' ? '#0875FF' : '#073B4C' } />
              <rect x='11' width='8' height='8' rx='4' fill={ selectedMenu === 'dashboard' ? '#0875FF' : '#073B4C' } />
              <rect y='11' width='8' height='8' rx='2' fill={ selectedMenu === 'dashboard' ? '#0875FF' : '#073B4C' } />
              <rect x='11' y='11' width='8' height='8' rx='2' fill={ selectedMenu === 'dashboard' ? '#0875FF' : '#073B4C' } />
            </svg>

            { __( 'Dashboard', 'storegrowth-sales-booster' ) }
          </Link>
        </h3>
        <div className='all-widgets-menu'>
          <h4 className={ `${ selectedMenu !== 'dashboard' ? 'active-menu' : '' }` }>
            <Image preview={ false } width={ 18 } src={ widgetIcon } />
            { __( 'All Modules', 'storegrowth-sales-booster' ) }
            <span onClick={toggleMenuClass} className='ant-menu-title-content'>
              {activeClass ? (
                <img src={upArrowIocn} width='12' />
              ) : (
                <img src={downArrowIocn} width='12' />
              )}
            </span>
          </h4>
          <ul
            className={
              activeClass ? 'widgets-menu ant-menu-hidden' : 'widgets-menu'
            }
          >
            {routes.map((route) => route?.name !== 'dashboard' && (
              <li
                key={route.name}
                onClick={() => handleLiClick(route.name)} // Handle the click event on <li>
                className={
                  selectedMenu === route.name
                    ? `sgsb-selected-module ${route.name}`
                    : `${route.name}`
                }
              >
                <Link
                  className={
                    selectedMenu === route.name ? 'sgsb-selected-link' : ''
                  }
                  data-route-name={route.name}
                  to={route.path}
                >
                  {route.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Layout.Sider>
  );
}

export default Sidebar;
