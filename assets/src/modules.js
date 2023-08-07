import { register } from '@wordpress/data';
import { render, StrictMode } from '@wordpress/element';
import { HashRouter } from 'react-router-dom';

import store from './modules-store';

import 'antd/dist/antd.css';
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
