import { register } from '@wordpress/data';
import { render, StrictMode } from '@wordpress/element';
import { HashRouter } from 'react-router-dom';

import settingsStore from './settings-store';
// import moduleStore from './modules-store';
import Layout from "./components/settings/Layout";

import 'antd/dist/reset.css';
import './admin.css';

register( settingsStore );
// register( moduleStore );

render(
  <StrictMode>
    <HashRouter>
      <Layout />
    </HashRouter>
  </StrictMode>,
  document.getElementById( "sbooster-settings-page" )
);
