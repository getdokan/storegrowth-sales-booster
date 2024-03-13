import React from 'react';
import Modules from './Modules';
import IniSetupLayout from '../initail-setup/IniSetupLayout';

let moduleRoutes = [
    {
        path    : '/',
        element : <Modules/>,
    },
    {
        path    : '/ini-setup',
        element : <IniSetupLayout/>,
    },
];


export default moduleRoutes;
