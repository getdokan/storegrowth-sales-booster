import { Col, Divider } from "antd";
import { __ } from "@wordpress/i18n";
import TabPanels from "./PanelSettings/TabPanels";
import { Fragment } from "react";

const PanelPreview = ( {
    children,
    colSpan = 12
} ) => {
    // Make tab menus with panels for tab preview.
    const tabPanels = [
        {
            key: 'preview',
            title: __( 'Preview', 'storegrowth-sales-booster' ),
            panel: children
        },
    ];

    return (
        <Fragment>
            {/* Use section divider for settings & preview. */}
            <Divider type="vertical" className={ `row-divider` } />
            {/* Handle preview column dynamically by using colSpan */}
            <Col span={ colSpan } className={ `panel-column` }>
                {/* Render tabs preview by using tab panels. */}
                <TabPanels
                    activeTab={ 'preview' }
                    tabPanels={ tabPanels }
                    classes={ 'preview-panel' }
                />
            </Col>
        </Fragment>
    )
}

export default PanelPreview;
