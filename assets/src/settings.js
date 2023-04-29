import { render, StrictMode } from '@wordpress/element';
import { register } from '@wordpress/data';
import { HashRouter } from 'react-router-dom';

import settingsStore from './settings-store';

import Layout from "./components/settings/Layout";

import 'antd/dist/antd.css';
import './admin.css';

register( settingsStore );

render(
  <StrictMode>
    <HashRouter>
      <Layout />
    </HashRouter>
  </StrictMode>,
  document.getElementById( "sbooster-settings-page" )
);
