import { addFilter } from '@wordpress/hooks';
import { __ } from '@wordpress/i18n';
import DokanCountdownTimer from './DokanCountdownTimer';

addFilter('sgsb_countdown_timer_tab_panels', 'sgsb_countdown_timer_tab_panels_callback', (panels, formData,
    onFieldChange,
    onFormSave,
    buttonLoading,
    onFormReset) => {
    return [
        ...panels,
        {
            key: 'vendor', title: __('Vendor', 'storegrowth-sales-booster-pro'),
            panel: <DokanCountdownTimer
                formData={formData}
                onFieldChange={onFieldChange}
                onFormSave={() => onFormSave("vendor_settings")}
                buttonLoading={buttonLoading}
                onFormReset={onFormReset}
            />,
        },
    ];
});

addFilter('sgsb_countdown_timer_initial_data', 'sgsb_countdown_timer_initial_data_callback', (data) => {
    return {
        ...data,
        vendor_can_create_countdown_discount: true,
        vendor_can_create_schedule_timer: true,
    }
} );