import { register } from '@wordpress/data';
import { render, StrictMode } from '@wordpress/element';
import { HashRouter } from 'react-router-dom';
import { menuFix } from "./utils/helper";
import store from './modules-store';

import 'antd/dist/reset.css';
import './admin.css';
import './admin.scss';
import Layout from "./components/modules/Layout";

register( store );

render(
  <StrictMode>
    <HashRouter>
      <Layout />
    </HashRouter>
  </StrictMode>,
  document.getElementById( "sbooster-modules-page" )
);

menuFix( 'sales-booster-for-woocommerce' );
