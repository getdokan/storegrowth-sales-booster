import { __ } from "@wordpress/i18n";
import ContentSection from "./appearance/ContentSection";
import TemplateSection from "./appearance/TemplateSection";
import ExpandPanels from "sales-booster/src/components/settings/Panels/PanelSettings/ExpandPanels";

const DesignSection = ( { triggerBumpUpdate } ) => {
    const panels = [
        {
            key: 1,
            label: __( 'Template Section', 'storegrowth-sales-booster' ),
            children: <TemplateSection triggerBumpUpdate={ triggerBumpUpdate } />,
        },
        {
            key: 2,
            label: __( 'Content Section', 'storegrowth-sales-booster' ),
            children: <ContentSection triggerBumpUpdate={ triggerBumpUpdate } />,
        }
    ];

    return (
        <ExpandPanels panels={ panels } />
    );
}

export default DesignSection;
