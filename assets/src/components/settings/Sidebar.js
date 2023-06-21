import { Layout, Menu } from 'antd';
import { Link, useLocation, Navigate, matchRoutes } from 'react-router-dom';
import { applyFilters } from '@wordpress/hooks';
import { useEffect, useState } from '@wordpress/element';

function Sidebar({ routes }) {
  let sidebarItems = applyFilters( 'sidebar_menu_items', [], Link );
  let firstItem = sidebarItems[0] || false;

  const location = useLocation();

  // Redirect to first menu if it is index page.
  // We need it because we don't have any general settings page.
  if ( location.pathname === '/' && firstItem ) {
    return <Navigate to={`/${firstItem.key}`} replace={true} />;
  }

  const [{ route: currentRoute }] = matchRoutes(routes, location);

  const [ selectedMenu, setSelectedMenu ] = useState( currentRoute?.name );

  useEffect( () => {
    setSelectedMenu( currentRoute?.name );
  }, [ currentRoute?.name ] );

  return (
    <Layout.Sider width={ 200 } className="site-layout-background">
      <Menu
        mode="inline"
        defaultSelectedKeys={ [ selectedMenu ] }
        style={ {
          height: "100%",
          borderRight: 0,
        } }
        items={ sidebarItems }
      />
    </Layout.Sider>
  );
}

export default Sidebar;
