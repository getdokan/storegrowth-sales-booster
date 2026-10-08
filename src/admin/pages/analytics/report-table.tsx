/**
 * The Analytics page's lists (campaigns, timer products): a table, and the
 * line Lite shows when it lists the top rows only.
 *
 * @since SPSG_VERSION
 */
import { __ } from '@wordpress/i18n';
import type { ReactNode } from 'react';
import { ProBadge } from '@storegrowth/components';

export interface ReportColumn {
    label: string;
    /** Right-aligned (numbers). */
    end?: boolean;
}

export interface ReportRow {
    key: string;
    /** One per column; the first is the row's name. */
    cells: ReactNode[];
}

interface ReportTableProps {
    columns: ReportColumn[];
    rows: ReportRow[];
}

/**
 * A report table.
 *
 * @param props         Props.
 * @param props.columns Columns.
 * @param props.rows    Rows.
 */
export function ReportTable( { columns, rows }: ReportTableProps ) {
    return (
        <div className="w-full overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-[14px] leading-5">
                <thead className="text-[13px] text-sg-muted">
                    <tr className="border-b border-sg-line">
                        { columns.map( ( column ) => {
                            return (
                                <th
                                    key={ column.label }
                                    className={ `py-2 pe-4 font-medium last:pe-0 ${
                                        column.end ? 'text-right' : ''
                                    }` }
                                >
                                    { column.label }
                                </th>
                            );
                        } ) }
                    </tr>
                </thead>
                <tbody className="text-sg-text">
                    { rows.map( ( row ) => {
                        return (
                            <tr
                                key={ row.key }
                                className="border-b border-sg-hairline last:border-0"
                            >
                                { row.cells.map( ( cell, index ) => {
                                    return (
                                        <td
                                            key={ columns[ index ].label }
                                            className={ `py-3 pe-4 last:pe-0 ${
                                                0 === index
                                                    ? 'font-medium text-sg-ink'
                                                    : ''
                                            } ${
                                                columns[ index ].end
                                                    ? 'text-right'
                                                    : ''
                                            }` }
                                        >
                                            { cell }
                                        </td>
                                    );
                                } ) }
                            </tr>
                        );
                    } ) }
                </tbody>
            </table>
        </div>
    );
}

interface LimitNoteProps {
    /** e.g. "Showing 3 of 8 campaigns." */
    message: string;
    upgradeUrl: string;
}

/**
 * Lite's "Showing 3 of 8" line with the upgrade link.
 *
 * @param props            Props.
 * @param props.message    What is shown of how many.
 * @param props.upgradeUrl Upgrade link.
 */
export function LimitNote( { message, upgradeUrl }: LimitNoteProps ) {
    return (
        <p className="flex flex-wrap items-center gap-2 text-[13px] leading-5 text-sg-muted">
            { message }
            <a
                href={ upgradeUrl }
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 font-medium text-sg-brand"
            >
                { __( 'Upgrade to Pro', 'storegrowth-sales-booster' ) }
                <ProBadge />
            </a>
        </p>
    );
}
