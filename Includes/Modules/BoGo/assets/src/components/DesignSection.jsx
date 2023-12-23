import { __ } from "@wordpress/i18n";
import TemplateSection from "./appearance/TemplateSection";
import ExpandPanels from "sales-booster/src/components/settings/Panels/PanelSettings/ExpandPanels";

const DesignSection = () => {
    const panels = [
        {
            key: 1,
            label: __( 'Template Section', 'storegrowth-sales-booster' ),
            children: <TemplateSection />,
        },
    ];

    return (
        <ExpandPanels panels={ panels } />
    );
}

export default DesignSection;
