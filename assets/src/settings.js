import { register } from '@wordpress/data';
import { render, StrictMode } from '@wordpress/element';
import { HashRouter } from 'react-router-dom';

import './components/settings';
import settingsStore from './settings-store';
import Layout from "./components/settings/Layout";

import 'antd/dist/reset.css';
import './admin.css';
import { menuFix } from "./utils/helper";

// Load pro prompts in premium product unavailable.
if ( !sgsbAdmin?.isPro ) {
    import( './components/pro-previews' ).then( ( module ) => module.default );
}

register( settingsStore );

render(
  <StrictMode>
    <HashRouter>
      <Layout />
    </HashRouter>
  </StrictMode>,
  document.getElementById( "sbooster-settings-page" )
);

menuFix( 'sales-booster-for-woocommerce' );
