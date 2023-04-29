import { Card, Form, Select, Slider, Col,Row} from 'antd';
import InputColor from 'react-input-color';
import { useState } from 'react';
import DesignChangeArea from './design-area/DesignChangeArea';
import OverViewArea from './overview-area/OverViewArea';
import ProductSelection from './design-area/ProductSelection';



function Template() {
    
return (
        <div className="bump-template-main-wrapper">
            
            <DesignChangeArea/>
            <OverViewArea/>
            
        </div>
  );
};

export default Template;