import ExpandPanels from "sales-booster/src/components/settings/Panels/PanelSettings/ExpandPanels";
import {__} from "@wordpress/i18n";

const DesignSection = () => {
    const panels = [
        {
            key: 1,
            label: __( 'Template Section', 'storegrowth-sales-booster' ),
            children: 'Hello World One'
        },
        {
            key: 2,
            label: __( 'Content Section', 'storegrowth-sales-booster' ),
            children: 'Hello World Two'
        },
    ];

    return (
        <ExpandPanels panels={ panels } />
    );
}

export default DesignSection;
