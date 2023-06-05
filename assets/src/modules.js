import { render, StrictMode } from '@wordpress/element';
import { register } from '@wordpress/data';

import store from './modules-store';

import Layout from "./components/modules/Layout";
import 'antd/dist/antd.css';
import './admin.css';
import './admin.scss';

register( store );

render(
  <StrictMode>
    <Layout />
  </StrictMode>,
  document.getElementById( "sbooster-modules-page" )
);
