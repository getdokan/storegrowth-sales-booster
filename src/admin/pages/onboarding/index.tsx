/**
 * First-run onboarding wizard (`#/ini-setup`): Welcome → Modules → Ready,
 * rebuilt on plugin-ui with the previous release's design.
 *
 * Activation redirects here until `spsg_ini_completion` is set, which
 * "Go to dashboard" and "Skip Guide" do (existing `spsg_inisetup_flag_update`
 * ajax action). Once set, this route sends the visitor to the dashboard.
 *
 * As before, the two consent checkboxes are not sent anywhere.
 *
 * @since SPSG_VERSION
 */
import { toast } from '@wedevs/plugin-ui';
import { useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { Navigate, useNavigate } from '@storegrowth/hooks';
import {
    completeOnboarding,
    errorMessage,
    getAdminData,
} from '@storegrowth/utilities';

import { ModulesScreen } from './modules-screen';
import { SuccessScreen } from './success-screen';
import { type Agreements, WelcomeScreen } from './welcome-screen';

export default function OnboardingPage() {
    // Read once on mount, so finishing isn't interrupted by the redirect.
    const [ alreadyDone ] = useState( () =>
        Boolean( getAdminData().onboardingCompleted )
    );

    if ( alreadyDone ) {
        return <Navigate to="/dashboard" replace />;
    }

    return <OnboardingWizard />;
}

function OnboardingWizard() {
    const navigate = useNavigate();

    const [ step, setStep ] = useState( 0 );
    const [ agreements, setAgreements ] = useState< Agreements >( {
        getUpdates: true,
        shareEssentials: true,
    } );

    const finish = async () => {
        try {
            await completeOnboarding();
            // Coming back to this route without a reload redirects too.
            getAdminData().onboardingCompleted = true;
            navigate( '/dashboard' );
        } catch ( error ) {
            toast.error(
                errorMessage(
                    error,
                    __(
                        'The setup could not be saved. Please try again.',
                        'storegrowth-sales-booster'
                    )
                )
            );
        }
    };

    if ( step === 1 ) {
        return (
            <ModulesScreen
                onBack={ () => setStep( 0 ) }
                onNext={ () => setStep( 2 ) }
            />
        );
    }

    if ( step === 2 ) {
        return (
            <SuccessScreen onBack={ () => setStep( 1 ) } onFinish={ finish } />
        );
    }

    return (
        <WelcomeScreen
            agreements={ agreements }
            onAgreementsChange={ setAgreements }
            onNext={ () => setStep( 1 ) }
        />
    );
}
