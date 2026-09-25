/**
 * Onboarding step 1: welcome, "Get Started" and the two consent checkboxes.
 *
 * @since SPSG_VERSION
 */
import { Button, Checkbox, cn } from '@wedevs/plugin-ui';
import { __ } from '@wordpress/i18n';
import { assetUrl } from '@storegrowth/utilities';

import { Announce, OnboardLayout, STEP_BUTTON_PRIMARY } from './onboard-layout';

export interface Agreements {
    /** Tips & tricks by email. */
    getUpdates: boolean;
    /** Appsero tracking opt-in. */
    shareEssentials: boolean;
}

export interface WelcomeScreenProps {
    agreements: Agreements;
    onAgreementsChange: ( agreements: Agreements ) => void;
    onNext: () => void;
}

/**
 * @since SPSG_VERSION
 *
 * @param props                    Props.
 * @param props.agreements         Checkbox values.
 * @param props.onAgreementsChange Update the checkboxes.
 * @param props.onNext             Go to the modules step.
 */
export function WelcomeScreen( {
    agreements,
    onAgreementsChange,
    onNext,
}: WelcomeScreenProps ) {
    const options: Array< {
        key: keyof Agreements;
        heading: string;
        content: string;
    } > = [
        {
            key: 'getUpdates',
            heading: __( 'Get Updates:', 'storegrowth-sales-booster' ),
            content: __(
                'We will send essential tips & tricks for effective usage of StoreGrowth.',
                'storegrowth-sales-booster'
            ),
        },
        {
            key: 'shareEssentials',
            heading: __( 'Share Essentials:', 'storegrowth-sales-booster' ),
            content: __(
                'Let us collect non-sensitive diagnosis data and usage information.',
                'storegrowth-sales-booster'
            ),
        },
    ];

    return (
        <OnboardLayout current={ 0 }>
            <div className="flex flex-col items-center">
                <div className="my-20 flex flex-col items-center gap-6">
                    <Announce
                        image={ assetUrl( 'images/welcome-announce.svg' ) }
                        title={ __(
                            'Welcome To StoreGrowth',
                            'storegrowth-sales-booster'
                        ) }
                        subtitle={ __(
                            'Conversion Boosting Toolkit for WooCommerce',
                            'storegrowth-sales-booster'
                        ) }
                    />
                    <Button
                        className={ cn( STEP_BUTTON_PRIMARY, 'text-base' ) }
                        onClick={ onNext }
                    >
                        { __( 'Get Started', 'storegrowth-sales-booster' ) }
                    </Button>
                </div>
                <div className="flex flex-col gap-4">
                    { options.map( ( { key, heading, content } ) => (
                        <label
                            key={ key }
                            htmlFor={ `spsg-onboard-${ key }` }
                            className="flex items-start gap-2 text-sm text-[#000012]"
                        >
                            <Checkbox
                                id={ `spsg-onboard-${ key }` }
                                className="mt-0.5 data-checked:border-[#b7dfff] data-checked:bg-white data-checked:text-[#008dff]"
                                checked={ agreements[ key ] }
                                onCheckedChange={ ( checked: boolean ) =>
                                    onAgreementsChange( {
                                        ...agreements,
                                        [ key ]: checked,
                                    } )
                                }
                            />
                            <span>
                                <strong className="font-semibold">
                                    { heading }
                                </strong>{ ' ' }
                                { content }
                            </span>
                        </label>
                    ) ) }
                </div>
            </div>
        </OnboardLayout>
    );
}
