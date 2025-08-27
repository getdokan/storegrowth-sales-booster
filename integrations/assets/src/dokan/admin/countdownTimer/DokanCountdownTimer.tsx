import React from 'react';
const DokanCountdownTimer = ({ formData, onFieldChange, onFormSave, buttonLoading, onFormReset }) => {
    // @ts-ignore
    const { SGSettings: { Switcher, SettingsSection, ActionsHandler } } = window;
    // Determine if the first toggle is enabled
    const canCreateCountdown = !!formData.vendor_can_create_countdown_discount;
    return (
        <SettingsSection>
            <div style={{ marginBottom: 24 }}>
                <strong style={{ fontSize: 18, display: 'block', marginBottom: 16 }}>Countdown Timer</strong>
                <Switcher
                    name="vendor_can_create_countdown_discount"
                    title="Vendors Can Create Countdown Timer"
                    isEnable={canCreateCountdown}
                    changeHandler={onFieldChange}
                />
                {canCreateCountdown && (
                    <Switcher
                        name="vendor_can_create_schedule_timer"
                        title="Vendors Can Schedule Timer"
                        isEnable={!!formData.vendor_can_create_schedule_timer}
                        changeHandler={onFieldChange}
                    />
                )}
            </div>
            <ActionsHandler
                resetHandler={onFormReset}
                loadingHandler={buttonLoading}
                saveHandler={onFormSave}
            />
        </SettingsSection>
    );
}

export default DokanCountdownTimer;
