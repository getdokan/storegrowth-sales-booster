/**
 * A report's list (campaigns, timer products) as a table. On Pro's Analytics
 * page and Lite's locked preview of it.
 *
 * @since 3.0.0
 */
import type { ReactNode } from 'react';

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

export interface ReportTableProps {
    columns: ReportColumn[];
    rows: ReportRow[];
}

/**
 * @since 3.0.0
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
