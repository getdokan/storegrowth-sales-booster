/**
 * Full-screen frame for the onboarding wizard, as in the previous release:
 * white page, logo, step indicator and a skip link on top.
 *
 * @since SPSG_VERSION
 */
import { Button } from '@wedevs/plugin-ui';
import { useEffect } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { Check } from 'lucide-react';
import type { ReactNode } from 'react';
import { getHeaderData } from '@storegrowth/utilities';

export interface OnboardLayoutProps {
    /** Index of the current step (0-based). */
    current: number;
    children: ReactNode;
    /** Label of the top-right skip link; hidden when empty. */
    skipLabel?: string;
    onSkip?: () => void;
}

/**
 * Step indicator: done steps get a check, the current one is filled blue.
 *
 * @since SPSG_VERSION
 *
 * @param props         Props.
 * @param props.current Index of the current step.
 */
function Steps( { current }: { current: number } ) {
    const steps = [
        __( 'Welcome', 'storegrowth-sales-booster' ),
        __( 'Modules', 'storegrowth-sales-booster' ),
        __( 'Ready', 'storegrowth-sales-booster' ),
    ];

    return (
        <ol className="m-0 flex w-full list-none items-center gap-3 p-0">
            { steps.map( ( label, index ) => {
                const done = index < current;
                const active = index === current;

                let circle = 'bg-[#F0F0F0] text-[rgba(0,0,0,0.45)]';
                if ( active ) {
                    circle = 'bg-sg-brand text-white';
                } else if ( done ) {
                    circle = 'bg-[#E6F4FF] text-sg-brand';
                }

                return (
                    <li
                        key={ label }
                        className={ `m-0 flex items-center gap-3 ${
                            index < steps.length - 1 ? 'flex-1' : ''
                        }` }
                        aria-current={ active ? 'step' : undefined }
                    >
                        <span
                            className={ `flex size-6 shrink-0 items-center justify-center rounded-full text-sm ${ circle }` }
                        >
                            { done ? (
                                <Check className="size-3.5" aria-hidden />
                            ) : (
                                index + 1
                            ) }
                        </span>
                        <span
                            className={ `whitespace-nowrap text-base ${
                                done || active
                                    ? 'text-[rgba(0,0,0,0.88)]'
                                    : 'text-[rgba(0,0,0,0.45)]'
                            }` }
                        >
                            { label }
                        </span>
                        { index < steps.length - 1 && (
                            <span
                                className={ `h-px min-w-6 flex-1 ${
                                    done ? 'bg-sg-brand' : 'bg-[#E9E9E9]'
                                }` }
                                aria-hidden
                            />
                        ) }
                    </li>
                );
            } ) }
        </ol>
    );
}

/**
 * @since SPSG_VERSION
 *
 * @param props           Props.
 * @param props.current   Index of the current step.
 * @param props.children  Step content.
 * @param props.skipLabel Top-right skip link label.
 * @param props.onSkip    Skip handler.
 */
export function OnboardLayout( {
    current,
    children,
    skipLabel,
    onSkip,
}: OnboardLayoutProps ) {
    // The wizard scrolls on its own; stop wp-admin scrolling underneath.
    useEffect( () => {
        const { overflow } = document.body.style;
        document.body.style.overflow = 'hidden';

        return () => {
            document.body.style.overflow = overflow;
        };
    }, [] );

    return (
        <div className="fixed inset-0 z-[100000] overflow-y-auto bg-white">
            <div className="mx-auto flex w-full max-w-[1100px] flex-col items-center px-4 pb-10 pt-8 sm:px-8">
                <div className="flex w-full flex-wrap items-center justify-between gap-x-[8%] gap-y-4">
                    <img
                        src={ getHeaderData().logo_url }
                        alt="StoreGrowth"
                        className="block h-7 w-auto"
                    />
                    <div className="order-last w-full md:order-none md:w-auto md:flex-1">
                        <Steps current={ current } />
                    </div>
                    <div className="min-w-[120px] text-right">
                        { skipLabel && onSkip && (
                            <Button
                                variant="link"
                                className="h-auto p-0 text-base font-medium text-[#1b49f6]"
                                onClick={ onSkip }
                            >
                                { skipLabel }
                            </Button>
                        ) }
                    </div>
                </div>
                <div className="w-full">{ children }</div>
            </div>
        </div>
    );
}

export interface AnnounceProps {
    /** Illustration URL. */
    image?: string;
    title: string;
    subtitle: string;
}

/**
 * Centred illustration, heading and sub-heading used by every step.
 *
 * @since SPSG_VERSION
 *
 * @param props          Props.
 * @param props.image    Illustration URL.
 * @param props.title    Heading.
 * @param props.subtitle Sub-heading.
 */
export function Announce( { image, title, subtitle }: AnnounceProps ) {
    return (
        <div className="flex flex-col items-center gap-6 text-center">
            { image && <img src={ image } alt="" className="block h-auto" /> }
            <div className="flex max-w-[530px] flex-col gap-2.5">
                <h1 className="m-0 text-[36px] font-bold leading-[1.2] text-[#073b4c]">
                    { title }
                </h1>
                <p className="m-0 text-base font-medium text-[#5a5a5f]">
                    { subtitle }
                </p>
            </div>
        </div>
    );
}

/** Classes of the wizard's large buttons (on plugin-ui's Button). */
export const STEP_BUTTON = 'h-auto rounded-md px-[30px] py-3 text-sm font-bold';
export const STEP_BUTTON_PRIMARY = `${ STEP_BUTTON } hover:bg-sg-brand-hover`;
export const STEP_BUTTON_SECONDARY = `${ STEP_BUTTON } border-black bg-white text-black hover:bg-sg-chip`;
