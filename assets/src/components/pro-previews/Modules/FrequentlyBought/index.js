import { __ } from "@wordpress/i18n";
import { addFilter } from "@wordpress/hooks";
import PromptNotice from "../../PromptNotice/PlanUpgradeModal";

// Handle stock bar modules pro settings prompts.
addFilter(
  "sgsb_frequently_bought_together_enable_settings",
  "sgsb_frequently_bought_together_enable_settings_callback",
  (component, routeData) => {
    return routeData;
  }
);
