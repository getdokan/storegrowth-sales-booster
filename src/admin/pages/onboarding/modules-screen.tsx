/**
 * Onboarding step 2: module cards (banner, icon, name, description, docs link
 * and switch). Switches save right away, as in the previous release.
 *
 * @since SPSG_VERSION
 */
import { toast } from '@wedevs/plugin-ui';
import { __, sprintf } from '@wordpress/i18n';
import { ToggleSwitch } from '@storegrowth/components';
import { useModules } from '@storegrowth/hooks';
import { errorMessage, moduleLabel } from '@storegrowth/utilities';

import {
    Announce,
    OnboardLayout,
    STEP_BUTTON_PRIMARY,
    STEP_BUTTON_SECONDARY,
} from './onboard-layout';

export interface ModulesScreenProps {
    onBack: () => void;
    onNext: () => void;
}

/**
 * @since SPSG_VERSION
 *
 * @param props        Props.
 * @param props.onBack Back to welcome.
 * @param props.onNext On to the last step.
 */
export function ModulesScreen( { onBack, onNext }: ModulesScreenProps ) {
    const { modules, pending, setModuleStatus } = useModules();

    const toggle = async ( module: SpsgModule, status: boolean ) => {
        try {
            await setModuleStatus( module.id, status );
        } catch ( error ) {
            toast.error(
                errorMessage(
                    error,
                    sprintf(
                        /* translators: %s: module name. */
                        __(
                            '%s could not be updated.',
                            'storegrowth-sales-booster'
                        ),
                        moduleLabel( module )
                    )
                )
            );
        }
    };

    return (
        <OnboardLayout
            current={ 1 }
            skipLabel={ __( 'Skip This Step', 'storegrowth-sales-booster' ) }
            onSkip={ onNext }
        >
            <div className="py-9">
                <Announce
                    title={ __(
                        'Choose and Enable Modules',
                        'storegrowth-sales-booster'
                    ) }
                    subtitle={ __(
                        'This is a list of all the modules of StoreGrowth. Enable your desired modules and get them ready for your next sales campaign.',
                        'storegrowth-sales-booster'
                    ) }
                />
            </div>

            <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                { modules.map( ( module ) => (
                    <div
                        key={ module.id }
                        className="flex flex-col overflow-hidden rounded-lg border border-[#F0F0F0] bg-white"
                    >
                        { module.banner && (
                            <img
                                src={ module.banner }
                                alt=""
                                className="block h-auto w-full"
                            />
                        ) }
                        <div className="flex items-center gap-4 px-6 pt-6">
                            <span className="flex size-[52px] shrink-0 items-center justify-center rounded-full bg-[#EAF4FF]">
                                { module.icon && (
                                    <img
                                        src={ module.icon }
                                        alt=""
                                        className="size-[37px]"
                                    />
                                ) }
                            </span>
                            <h3 className="m-0 text-lg font-bold text-[#073b4c]">
                                { moduleLabel( module ) }
                            </h3>
                        </div>
                        <p className="m-0 flex-1 px-6 pt-4 text-sm leading-[1.6] text-[#5a5a5f]">
                            { module.description }
                        </p>
                        <div className="mt-5 flex items-center justify-between gap-4 border-t border-[#F0F0F0] px-6 py-4">
                            <a
                                href={
                                    module.doc_link ||
                                    'https://storegrowth.io/docs/'
                                }
                                target="_blank"
                                rel="noreferrer"
                                className="rounded-md border border-sg-stroke bg-white px-3 py-1.5 text-sm font-medium text-sg-slate no-underline hover:bg-sg-chip hover:text-sg-heading focus:shadow-none"
                            >
                                { __(
                                    'Documentation',
                                    'storegrowth-sales-booster'
                                ) }
                            </a>
                            <ToggleSwitch
                                checked={ module.status }
                                disabled={ pending.includes( module.id ) }
                                onCheckedChange={ ( checked: boolean ) =>
                                    toggle( module, checked )
                                }
                                aria-label={ sprintf(
                                    /* translators: %s: module name. */
                                    __(
                                        'Enable %s',
                                        'storegrowth-sales-booster'
                                    ),
                                    moduleLabel( module )
                                ) }
                            />
                        </div>
                    </div>
                ) ) }
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
                    onClick={ onNext }
                >
                    { __( 'Next Step', 'storegrowth-sales-booster' ) }
                </button>
            </div>
        </OnboardLayout>
    );
}
