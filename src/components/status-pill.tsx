/**
 * Module status pill (design `.pill-active`).
 *
 * The design only draws the active state; the inactive state reuses the same
 * shape in neutral colours (listed design deviation: pro/inactive states).
 *
 * @since SPSG_VERSION
 */
import { __ } from '@wordpress/i18n';
import { CircleCheck, CircleMinus } from 'lucide-react';

export interface StatusPillProps {
    active: boolean;
}

/**
 * @since SPSG_VERSION
 *
 * @param props        Props.
 * @param props.active Whether the module is active.
 */
export function StatusPill( { active }: StatusPillProps ) {
    if ( active ) {
        return (
            <span className="flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-[20px] bg-[#F0FDF4] px-3 py-1.5 text-[12px] leading-[1.4] text-[#0D542B]">
                <CircleCheck
                    className="h-3 w-3 fill-[#00A63E] text-white"
                    strokeWidth={ 2 }
                    aria-hidden
                />
                { __( 'Active', 'storegrowth-sales-booster' ) }
            </span>
        );
    }

    return (
        <span className="flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-[20px] bg-sg-chip px-3 py-1.5 text-[12px] leading-[1.4] text-sg-muted">
            <CircleMinus className="h-3 w-3" strokeWidth={ 2 } aria-hidden />
            { __( 'Inactive', 'storegrowth-sales-booster' ) }
        </span>
    );
}
