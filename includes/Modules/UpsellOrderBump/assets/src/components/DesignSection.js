import { __ } from "@wordpress/i18n";
import ContentSection from "./appearance/ContentSection";
import TemplateSection from "./appearance/TemplateSection";
import ExpandPanels from "sales-booster/src/components/settings/Panels/PanelSettings/ExpandPanels";

const DesignSection = () => {
    const panels = [
        {
            key: 1,
            label: __( 'Template Section', 'storegrowth-sales-booster' ),
            children: <TemplateSection />,
        },
        {
            key: 2,
            label: __( 'Content Section', 'storegrowth-sales-booster' ),
            children: <ContentSection />,
        }
    ];

    return (
        <ExpandPanels panels={ panels } />
    );
}

export default DesignSection;
