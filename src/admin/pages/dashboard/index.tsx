/**
 * Dashboard (design `index.html`): stat tiles, modules grouped by goal, and the
 * Pro / support / links rail.
 *
 * @since SPSG_VERSION
 */
import { cn } from '@wedevs/plugin-ui';
import { useEffect, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import {
    ArrowUpRight,
    Banknote,
    CircleCheckBig,
    CircleHelp,
    Crown,
    FileSpreadsheet,
    Headset,
    LayoutGrid,
    LayoutTemplate,
    type LucideIcon,
} from 'lucide-react';
import { ModuleIcon, StatusPill } from '@storegrowth/components';
import { Link, useModules } from '@storegrowth/hooks';
import {
    DASHBOARD_GROUPS,
    MODULE_CATALOG,
    fetchDashboardOverview,
    getAdminData,
    moduleLabel,
    type DashboardOverview,
} from '@storegrowth/utilities';

interface StatTileProps {
    title: string;
    value: string;
    icon: LucideIcon;
    chipClass: string;
    iconClass: string;
}

function StatTile( {
    title,
    value,
    icon: Icon,
    chipClass,
    iconClass,
}: StatTileProps ) {
    return (
        <div className="flex min-w-0 flex-[1_1_245px] flex-col items-start rounded-[16px] bg-white p-[25px] shadow-[inset_0_0_0_1px_#F9FAFB]">
            <div className="flex w-full flex-col items-start gap-6">
                <div className="flex w-full items-center justify-between gap-2">
                    <h3 className="text-[16px] font-semibold leading-6 text-sg-ink">
                        { title }
                    </h3>
                    <div
                        className={ cn(
                            'flex h-8 shrink-0 items-center rounded-[6px] px-2 pb-[4.5px] pt-[3.5px]',
                            chipClass
                        ) }
                    >
                        <Icon
                            className={ cn( 'h-4 w-4', iconClass ) }
                            strokeWidth={ 2.25 }
                            aria-hidden
                        />
                    </div>
                </div>
                <p className="text-[24px] font-bold leading-[1.3] text-sg-value">
                    { value }
                </p>
            </div>
        </div>
    );
}

/**
 * Two-digit count as in the design ("06").
 *
 * @param value Count.
 */
function padCount( value: number ): string {
    return String( value ).padStart( 2, '0' );
}

export default function DashboardPage() {
    const { modules } = useModules();
    const { isPro, urls } = getAdminData();
    const [ overview, setOverview ] = useState< DashboardOverview | null >(
        null
    );

    useEffect( () => {
        fetchDashboardOverview()
            .then( setOverview )
            .catch( () => setOverview( null ) );
    }, [] );

    const activeCount = modules.filter( ( module ) => module.status ).length;
    const empty = '—';

    return (
        <div className="flex w-full flex-col items-center px-4 pb-12 pt-12 sm:px-8">
            <div className="flex w-full max-w-[1280px] flex-col items-start gap-6">
                <div className="flex w-full flex-col items-start gap-1">
                    <h1 className="sg-display text-[24px] font-bold leading-[1.3] text-sg-text">
                        { __( 'Dashboard', 'storegrowth-sales-booster' ) }
                    </h1>
                    <p className="text-[14px] leading-5 text-sg-muted">
                        { __(
                            'Here’s what’s happening with your pipeline today.',
                            'storegrowth-sales-booster'
                        ) }
                    </p>
                </div>

                <div className="flex w-full flex-wrap content-start items-start gap-3">
                    <StatTile
                        title={ __(
                            'All Modules',
                            'storegrowth-sales-booster'
                        ) }
                        value={ padCount( modules.length ) }
                        icon={ LayoutGrid }
                        chipClass="bg-sg-brand-soft"
                        iconClass="text-sg-brand"
                    />
                    <StatTile
                        title={ __(
                            'Active Modules',
                            'storegrowth-sales-booster'
                        ) }
                        value={ padCount( activeCount ) }
                        icon={ CircleCheckBig }
                        chipClass="bg-[#FAF5FF]"
                        iconClass="text-[#9810FA]"
                    />
                    <StatTile
                        title={ __( 'Revenue', 'storegrowth-sales-booster' ) }
                        value={ overview?.revenue?.formatted ?? empty }
                        icon={ Banknote }
                        chipClass="bg-[#FFFBEB]"
                        iconClass="text-[#D97706]"
                    />
                    <StatTile
                        title={ __(
                            'Predefined Templates',
                            'storegrowth-sales-booster'
                        ) }
                        value={
                            overview?.templates !== null &&
                            overview?.templates !== undefined
                                ? padCount( overview.templates )
                                : empty
                        }
                        icon={ LayoutTemplate }
                        chipClass="bg-[#FDF2F8]"
                        iconClass="text-[#EC4899]"
                    />
                </div>

                <div className="flex w-full flex-wrap items-start gap-6">
                    <div className="flex min-w-0 flex-[1_1_520px] flex-col gap-6">
                        { DASHBOARD_GROUPS.map( ( group ) => {
                            const rows = group.modules
                                .map( ( id ) =>
                                    modules.find(
                                        ( module ) => module.id === id
                                    )
                                )
                                .filter( ( module ): module is SpsgModule =>
                                    Boolean( module )
                                );

                            if ( ! rows.length ) {
                                return null;
                            }

                            return (
                                <section
                                    key={ group.id }
                                    className="flex w-full flex-col items-center rounded-[16px] bg-white"
                                >
                                    <h2 className="w-full rounded-t-[16px] px-6 py-4 text-[16px] font-semibold leading-6 text-sg-heading">
                                        { group.title }
                                    </h2>
                                    <div className="h-px w-full shrink-0 bg-sg-line" />
                                    <div className="flex w-full flex-col items-start gap-6 rounded-b-[16px] p-6">
                                        { rows.map( ( module ) => (
                                            <Link
                                                key={ module.id }
                                                to={ `/${ module.id }` }
                                                className="flex w-full flex-wrap items-center gap-4 rounded-[8px] text-inherit no-underline transition-colors hover:bg-sg-row-hover focus:shadow-none sm:flex-nowrap"
                                            >
                                                <span className="flex shrink-0 items-center justify-center rounded-full bg-[rgba(8,117,255,.1)] p-1">
                                                    <span className="flex h-8 w-8 items-center justify-center">
                                                        <ModuleIcon
                                                            id={ module.id }
                                                            variant="dashboard"
                                                            className="h-5 w-5 text-sg-brand"
                                                        />
                                                    </span>
                                                </span>
                                                <div className="flex min-w-px flex-1 flex-col items-start gap-[3.25px]">
                                                    <h4 className="w-full text-[14px] font-semibold leading-[1.3] text-sg-ink">
                                                        { moduleLabel(
                                                            module
                                                        ) }
                                                    </h4>
                                                    <p className="w-full text-[12px] leading-[1.4] text-sg-muted">
                                                        { MODULE_CATALOG[
                                                            module.id
                                                        ]?.summary ||
                                                            module.description }
                                                    </p>
                                                </div>
                                                <span className="ml-14 sm:ml-0">
                                                    <StatusPill
                                                        active={ module.status }
                                                    />
                                                </span>
                                            </Link>
                                        ) ) }
                                    </div>
                                </section>
                            );
                        } ) }
                    </div>

                    <div className="flex w-full flex-[1_1_100%] flex-col gap-6 min-[1161px]:w-[410px] min-[1161px]:flex-[0_0_410px]">
                        { ! isPro && (
                            <section className="flex w-full flex-col items-start gap-12 rounded-[16px] bg-[linear-gradient(240.833deg,#FFC408_0%,#FFFFFF_100%)] p-6">
                                <div className="flex w-full flex-col items-start gap-6">
                                    <span className="flex shrink-0 items-start gap-2.5 rounded-[20px] bg-sg-amber-pro px-3 py-1.5">
                                        <span className="whitespace-nowrap text-[12px] leading-[1.4] text-black">
                                            { __(
                                                'Unlock Pro',
                                                'storegrowth-sales-booster'
                                            ) }
                                        </span>
                                        <Crown
                                            className="h-4 w-4 text-black"
                                            strokeWidth={ 1.5 }
                                            aria-hidden
                                        />
                                    </span>
                                    <div className="flex w-full flex-col items-start gap-2">
                                        <h2 className="sg-display w-full text-[24px] font-bold leading-[1.3] text-sg-heading">
                                            { __(
                                                'Unlock More Growth With StoreGrowth Pro',
                                                'storegrowth-sales-booster'
                                            ) }
                                        </h2>
                                        <p className="w-full text-[12px] leading-[1.4] text-sg-muted">
                                            { __(
                                                'Get advanced features, new modules, priority support, and the tools you need to grow your store.',
                                                'storegrowth-sales-booster'
                                            ) }
                                        </p>
                                    </div>
                                </div>
                                <a
                                    href={ urls.upgrade }
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex shrink-0 items-center gap-2.5 rounded-[6px] bg-black px-6 py-2.5 text-[14px] font-medium leading-5 text-white no-underline transition-colors hover:bg-[#1F1F1F] hover:text-white focus:shadow-none"
                                >
                                    <span className="whitespace-nowrap">
                                        { __(
                                            'Unlock Pro',
                                            'storegrowth-sales-booster'
                                        ) }
                                    </span>
                                    <ArrowUpRight
                                        className="h-4 w-4"
                                        strokeWidth={ 2 }
                                        aria-hidden
                                    />
                                </a>
                            </section>
                        ) }

                        <div className="flex w-full flex-col items-start">
                            <section className="flex w-full flex-col items-center gap-8 rounded-t-[16px] bg-white p-6 shadow-[inset_0_0_0_1px_#F9FAFB]">
                                <div className="flex w-full flex-col items-center gap-[31px]">
                                    <span className="flex shrink-0 items-center rounded-full bg-sg-brand-soft p-[20.267px]">
                                        <Headset
                                            className="h-[40.534px] w-[40.534px] text-sg-brand"
                                            strokeWidth={ 1.5 }
                                            aria-hidden
                                        />
                                    </span>
                                    <div className="flex w-full flex-col items-center gap-2 text-center">
                                        <h2 className="sg-display text-[24px] font-bold leading-[1.3] text-sg-heading">
                                            { __(
                                                'Need Your Help?',
                                                'storegrowth-sales-booster'
                                            ) }
                                        </h2>
                                        <p className="w-full text-[12px] leading-[1.4] text-sg-muted">
                                            { __(
                                                'Our support team is here to help you set up and grow your store.',
                                                'storegrowth-sales-booster'
                                            ) }
                                        </p>
                                    </div>
                                </div>
                                <a
                                    href={ urls.support }
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex shrink-0 items-center gap-2.5 rounded-[6px] bg-sg-brand px-6 py-2.5 text-[14px] font-medium leading-5 text-white no-underline transition-colors hover:bg-sg-brand-hover hover:text-white focus:shadow-none"
                                >
                                    <span className="whitespace-nowrap">
                                        { __(
                                            'Contact Support',
                                            'storegrowth-sales-booster'
                                        ) }
                                    </span>
                                    <ArrowUpRight
                                        className="h-4 w-4"
                                        strokeWidth={ 2 }
                                        aria-hidden
                                    />
                                </a>
                            </section>
                            <section className="flex w-full flex-col items-center rounded-b-[16px] bg-white shadow-[inset_0_0_0_1px_#F9FAFB]">
                                { [
                                    {
                                        href: urls.docs,
                                        icon: FileSpreadsheet,
                                        title: __(
                                            'Documentation',
                                            'storegrowth-sales-booster'
                                        ),
                                        text: __(
                                            'Check our documentation for quick, step-by-step guidance on using our plugin.',
                                            'storegrowth-sales-booster'
                                        ),
                                    },
                                    {
                                        href: urls.featureRequest,
                                        icon: CircleHelp,
                                        title: __(
                                            'Request a feature',
                                            'storegrowth-sales-booster'
                                        ),
                                        text: __(
                                            'Tell us what would help your store grow, and we’ll consider it for a future release.',
                                            'storegrowth-sales-booster'
                                        ),
                                    },
                                ].map( ( row, index ) => (
                                    <a
                                        key={ row.title }
                                        href={ row.href }
                                        target="_blank"
                                        rel="noreferrer"
                                        className={ cn(
                                            'flex w-full items-center gap-4 px-6 py-5 text-inherit no-underline transition-colors hover:bg-sg-row-hover focus:shadow-none',
                                            index === 0 &&
                                                'border-y border-sg-line',
                                            index === 1 && 'rounded-b-[16px]'
                                        ) }
                                    >
                                        <span className="flex min-w-px flex-1 items-center gap-3">
                                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sg-brand-soft">
                                                <row.icon
                                                    className="h-5 w-5 text-sg-brand"
                                                    strokeWidth={ 1.5 }
                                                    aria-hidden
                                                />
                                            </span>
                                            <span className="flex min-w-px flex-1 flex-col items-start gap-2">
                                                <span className="text-[14px] font-semibold leading-[1.3] text-sg-heading">
                                                    { row.title }
                                                </span>
                                                <span className="w-full text-[12px] leading-[1.4] text-sg-muted">
                                                    { row.text }
                                                </span>
                                            </span>
                                        </span>
                                        <ArrowUpRight
                                            className="h-6 w-6 shrink-0 text-sg-brand"
                                            strokeWidth={ 1.5 }
                                            aria-hidden
                                        />
                                    </a>
                                ) ) }
                            </section>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
