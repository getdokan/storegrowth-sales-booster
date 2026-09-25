/**
 * Modules page (design `modules.html`, Figma node 107:4660): master switch and
 * a grid of module cards with thumbnail, description, Docs link and switch.
 *
 * @since SPSG_VERSION
 */
import { toast } from '@wedevs/plugin-ui';
import { __, sprintf } from '@wordpress/i18n';
import { ArrowUpRight } from 'lucide-react';
import { CardHead, ToggleSwitch } from '@storegrowth/components';
import { Link, useModules } from '@storegrowth/hooks';
import { assetUrl, errorMessage, moduleLabel } from '@storegrowth/utilities';

export default function ModulesPage() {
    const { modules, pending, setModuleStatus, setAllModulesStatus } =
        useModules();

    const allActive = modules.length > 0 && modules.every( ( m ) => m.status );

    // The design lists module cards alphabetically.
    const cards = [ ...modules ].sort( ( a, b ) =>
        moduleLabel( a ).localeCompare( moduleLabel( b ) )
    );

    const toggleAll = async ( status: boolean ) => {
        try {
            await setAllModulesStatus( status );
        } catch ( error ) {
            toast.error(
                errorMessage(
                    error,
                    __(
                        'The modules could not be updated.',
                        'storegrowth-sales-booster'
                    )
                )
            );
        }
    };

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
        <div className="flex w-full flex-col items-center px-4 pb-12 pt-12 sm:px-8">
            <div className="flex w-full max-w-[1280px] flex-col items-start">
                <CardHead
                    className="rounded-b-none"
                    title={ __( 'Modules', 'storegrowth-sales-booster' ) }
                    actions={
                        <>
                            <span className="text-[14px] leading-[1.4] text-sg-text">
                                { __(
                                    'Active All Modules',
                                    'storegrowth-sales-booster'
                                ) }
                            </span>
                            <ToggleSwitch
                                checked={ allActive }
                                disabled={ pending.length > 0 }
                                onCheckedChange={ toggleAll }
                                aria-label={ __(
                                    'Enable all modules',
                                    'storegrowth-sales-booster'
                                ) }
                            />
                        </>
                    }
                />
                <div className="grid w-full grid-cols-1 gap-px rounded-b-[8px] px-px pb-px min-[521px]:grid-cols-2 min-[861px]:grid-cols-3 min-[1181px]:grid-cols-4">
                    { cards.map( ( module ) => (
                        <div
                            key={ module.id }
                            className="flex w-full flex-col items-start gap-6 rounded-[8px] bg-white p-6"
                        >
                            <Link
                                to={ `/${ module.id }` }
                                className="flex w-full flex-col items-start gap-6 text-inherit no-underline focus:shadow-none"
                            >
                                <div className="aspect-[4/3] w-full overflow-hidden rounded-[8px] bg-[#EDEDED]">
                                    <img
                                        src={ assetUrl(
                                            `images/modules/${ module.id }.png`
                                        ) }
                                        onError={ ( event ) => {
                                            if ( module.banner ) {
                                                event.currentTarget.src =
                                                    module.banner;
                                            }
                                        } }
                                        alt=""
                                        className="block h-full w-full object-cover"
                                    />
                                </div>
                                <div className="flex w-full flex-col items-start gap-2.5">
                                    <h3 className="w-full text-[18px] font-bold leading-[1.3] text-[#3F3F3F]">
                                        { moduleLabel( module ) }
                                    </h3>
                                    <p className="w-full text-[14px] leading-[1.4] text-sg-muted">
                                        { module.description }
                                    </p>
                                </div>
                            </Link>
                            <div className="mt-auto flex w-full items-center justify-between gap-4">
                                <a
                                    href={ module.doc_link }
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex items-center gap-1.5 rounded-[6px] border border-sg-stroke bg-white px-3 py-1.5 text-[14px] font-medium leading-5 text-sg-slate no-underline hover:bg-sg-chip hover:text-sg-heading focus:shadow-none"
                                >
                                    { __(
                                        'Docs',
                                        'storegrowth-sales-booster'
                                    ) }
                                    <ArrowUpRight
                                        className="h-4 w-4"
                                        strokeWidth={ 2 }
                                        aria-hidden
                                    />
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
            </div>
        </div>
    );
}
