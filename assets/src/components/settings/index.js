import * as PanelComponents from './Panels';

window.SGSettings = window.SGSettings || {};
// Bind necessary settings components on window.sgsettings
Object.keys( PanelComponents ).forEach( key => {
    window.SGSettings[ key ] = PanelComponents?.[ key ];
});
