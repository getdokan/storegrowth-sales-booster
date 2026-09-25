/**
 * Onboarding step 3: congratulations, help links and "Go to dashboard".
 *
 * @since SPSG_VERSION
 */
import { __ } from '@wordpress/i18n';
import { FileText, Headset } from 'lucide-react';
import type { ReactNode } from 'react';
import { assetUrl, getHeaderData } from '@storegrowth/utilities';

import {
    Announce,
    OnboardLayout,
    STEP_BUTTON_PRIMARY,
    STEP_BUTTON_SECONDARY,
} from './onboard-layout';

const TUTORIALS_URL =
    'https://www.youtube.com/playlist?list=PLJorZsV2RVv9t0NTRb27PoS0pUkywfowX';

/** YouTube's red play mark (from the previous wizard). */
function YoutubeMark() {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="21"
            height="20"
            viewBox="0 0 21 20"
            fill="none"
            aria-hidden
        >
            <path
                d="M19.55 5.82143C19.325 5.07143 18.7625 4.53571 17.975 4.32143C16.625 4 10.8875 4 10.8875 4C10.8875 4 5.26251 4 3.80001 4.32143C3.01251 4.53571 2.45 5.07143 2.225 5.82143C2 7.21429 2 10 2 10C2 10 2 12.7857 2.3375 14.1786C2.5625 14.9286 3.125 15.4643 3.9125 15.6786C5.2625 16 11 16 11 16C11 16 16.625 16 18.0875 15.6786C18.875 15.4643 19.4375 14.9286 19.6625 14.1786C20 12.7857 20 10 20 10C20 10 20 7.21429 19.55 5.82143ZM9.19999 12.5714V7.42857L13.925 10L9.19999 12.5714Z"
                fill="#FF0000"
            />
        </svg>
    );
}

export interface SuccessScreenProps {
    onBack: () => void;
    /** Mark onboarding done and open the dashboard. */
    onFinish: () => void;
}

/**
 * @since SPSG_VERSION
 *
 * @param props          Props.
 * @param props.onBack   Back to the modules step.
 * @param props.onFinish Finish the wizard.
 */
export function SuccessScreen( { onBack, onFinish }: SuccessScreenProps ) {
    const { docs_url: docsUrl, support_url: supportUrl } =
        getHeaderData().header_info;

    const links: Array< {
        href: string;
        label: string;
        icon: ReactNode;
        className: string;
    } > = [
        {
            href: TUTORIALS_URL,
            label: __( 'Youtube', 'storegrowth-sales-booster' ),
            icon: <YoutubeMark />,
            className: 'bg-[#ffd5d5]',
        },
        {
            href: supportUrl,
            label: __( 'Get Support', 'storegrowth-sales-booster' ),
            icon: <Headset className="size-5 text-[#008DFF]" aria-hidden />,
            className: 'bg-[#b7dfff]',
        },
        {
            href: docsUrl,
            label: __( 'Documentation', 'storegrowth-sales-booster' ),
            icon: <FileText className="size-5 text-[#FF5C00]" aria-hidden />,
            className: 'bg-[#ffe7d9]',
        },
    ];

    return (
        <OnboardLayout
            current={ 2 }
            skipLabel={ __( 'Skip Guide', 'storegrowth-sales-booster' ) }
            onSkip={ onFinish }
        >
            <div className="my-10 flex flex-col items-center gap-6">
                <Announce
                    image={ assetUrl( 'images/congrats-announce.svg' ) }
                    title={ __(
                        'Congratulations!',
                        'storegrowth-sales-booster'
                    ) }
                    subtitle={ __(
                        'You are at the last step to complete the setup process and start using the exciting features of StoreGrowth',
                        'storegrowth-sales-booster'
                    ) }
                />
                <div className="flex flex-wrap justify-center gap-2.5">
                    { links.map( ( { href, label, icon, className } ) => (
                        <a
                            key={ label }
                            href={ href }
                            target="_blank"
                            rel="noreferrer"
                            className={ `flex items-center gap-2 rounded-[10px] py-2 pl-2 pr-3 text-sm font-medium text-[#000012] no-underline hover:text-[#000012] focus:shadow-none ${ className }` }
                        >
                            { icon }
                            { label }
                        </a>
                    ) ) }
                </div>
            </div>

            <div className="flex justify-center gap-2.5">
                <button
                    type="button"
                    className={ STEP_BUTTON_SECONDARY }
                    onClick={ onBack }
                >
                    { __( 'Previous', 'storegrowth-sales-booster' ) }
                </button>
                <button
                    type="button"
                    className={ STEP_BUTTON_PRIMARY }
                    onClick={ onFinish }
                >
                    { __( 'Go to dashboard', 'storegrowth-sales-booster' ) }
                </button>
            </div>
        </OnboardLayout>
    );
}
