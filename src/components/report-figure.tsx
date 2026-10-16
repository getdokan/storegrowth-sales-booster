/**
 * One figure of a report tile or card: label, value, the change from the
 * previous period (Pro's comparison) and a short hint. On Pro's Analytics
 * page and Lite's locked preview of it.
 *
 * @since 3.0.0
 */
import { __, sprintf } from '@wordpress/i18n';

export interface ReportFigureProps {
    label: string;
    value: string;
    hint?: string;
    /** Percent change from the previous period; null when that was 0. */
    change?: number | null;
}

/**
 * The change from the previous period: an arrow and the percentage, in text
 * colors (the arrow and sign carry the direction, not a color).
 *
 * @param props        Props.
 * @param props.change Percent change.
 */
function Change( { change }: { change: number | null } ) {
    if ( null === change ) {
        return (
            <span className="text-[12px] leading-4 text-sg-help">
                { __( 'New this period', 'storegrowth-sales-booster' ) }
            </span>
        );
    }

    const arrow = change > 0 ? '↑' : '↓';

    return (
        <span className="text-[12px] font-medium leading-4 text-sg-muted">
            { 0 === change ? '' : `${ arrow } ` }
            { sprintf(
                /* translators: %s: percent change, e.g. 12.5. */
                __( '%s%% vs previous period', 'storegrowth-sales-booster' ),
                String( Math.abs( change ) )
            ) }
        </span>
    );
}

/**
 * @since 3.0.0
 *
 * @param props        Props.
 * @param props.label  Label.
 * @param props.value  Value.
 * @param props.hint   Short explanation under the value.
 * @param props.change Percent change from the previous period.
 */
export function ReportFigure( {
    label,
    value,
    hint,
    change,
}: ReportFigureProps ) {
    return (
        <div className="flex min-w-0 flex-col gap-1">
            <span className="text-[13px] leading-5 text-sg-muted">
                { label }
            </span>
            <span className="text-[20px] font-bold leading-[1.3] text-sg-ink">
                { value }
            </span>
            { undefined !== change && <Change change={ change } /> }
            { hint && (
                <span className="text-[12px] leading-4 text-sg-help">
                    { hint }
                </span>
            ) }
        </div>
    );
}
