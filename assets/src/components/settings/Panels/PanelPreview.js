import { Col, Divider } from "antd";
import {__} from "@wordpress/i18n";
import TabPanels from "./PanelSettings/TabPanels";

const PanelPreview = ( {
    children,
    colSpan = 12
} ) => {
    const tabPanels = [
        {
            key: 'preview',
            title: __( 'Preview', 'storegrowth-sales-booster' ),
            panel: children
        },
    ];

    return (
        <>
            <Divider type="vertical" className={ `row-divider` } />
            <Col span={ colSpan } className={ `panel-column` }>
                <TabPanels
                    activeTab={ 'preview' }
                    tabPanels={ tabPanels }
                    classes={ 'preview-panel' }
                />
            </Col>
        </>
    )
}

export default PanelPreview;
