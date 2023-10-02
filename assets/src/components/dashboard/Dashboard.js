import { Col } from 'antd';
import Content from './Content';
import Promotion from './Promotion';
import PanelRow from '../settings/Panels/PanelRow';
import { useLocation, Navigate } from 'react-router-dom';
import PanelContainer from '../settings/Panels/PanelContainer';

function Dashboard() {
  const location = useLocation();

  if ( location.pathname === '/dashboard' ) {
    return <Navigate to={`/dashboard/overview`} replace={true} />;
  }
  
  return (
    <div className='site-card-wrapper sgsb-admin-dashboard'>
      <div className='sgsb-admin-dashboard-module'>
        <div
          className='sgsb-dasboard-container'
          style={ { padding: '40px 0px 0px 40px' } }
        >
          <PanelContainer>
            <PanelRow>
              <Col span={ 16 }>
                <Content />
              </Col>
              <Col span={ 8 }>
                <Promotion />
              </Col>
            </PanelRow>
          </PanelContainer>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
