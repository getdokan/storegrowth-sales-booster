import { Typography, Divider } from 'antd';
import { Switch } from 'antd';
import {__} from "@wordpress/i18n";
import { deactivatorHandler , removeHashFromURL} from '../../../utils/helper';
import SettingsTooltip from './PanelSettings/SettingsTooltip';
const { Title } = Typography;

const PanelHeader = ( { title, children , moduleId = ''} ) => {
    
    return (
        <div className={ `panel-header` }>
            {/* Render settings heading with divider. */}
            <div className={ `panel-title-wrap` }>
                <Title level={ 3 } className={ `header-content` }>
                    <div className={ `header-content-wrapper` }>
                        { title }
                        <Switch checkedChildren="Disable" defaultChecked onChange={ () => deactivatorHandler(moduleId) }/>
                        <SettingsTooltip content={__(`Toggle switch to disable the module`,'storegrowth-sales-booster')}/>
                    </div>
                    { children } 
                </Title>
                
            </div>
            <Divider className={ `header-divider` } />
            
        </div>
    );
}

export default PanelHeader;
