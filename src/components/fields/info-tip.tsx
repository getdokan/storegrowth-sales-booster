/**
 * Info tip (design `.tip`): an info icon that shows a short explanation on
 * hover or keyboard focus. plugin-ui Tooltip.
 *
 * @since SPSG_VERSION
 */
import { Tooltip, TooltipContent, TooltipTrigger } from '@wedevs/plugin-ui';
import { __, sprintf } from '@wordpress/i18n';
import { Info } from 'lucide-react';

export interface InfoTipProps {
    /** The explanation. */
    text: string;
    /** What it explains, for the icon's accessible name. */
    about?: string;
}

/**
 * @since SPSG_VERSION
 *
 * @param props       Props.
 * @param props.text  Explanation.
 * @param props.about What it explains.
 */
export function InfoTip( { text, about }: InfoTipProps ) {
    return (
        <Tooltip>
            <TooltipTrigger
                aria-label={
                    about
                        ? sprintf(
                              /* translators: %s: what the tip explains, e.g. an option. */
                              __( 'About %s', 'storegrowth-sales-booster' ),
                              about
                          )
                        : __( 'More information', 'storegrowth-sales-booster' )
                }
                className="inline-flex shrink-0 items-center rounded-full border-0 bg-transparent p-0 text-sg-help hover:text-sg-brand"
            >
                <Info className="size-4" strokeWidth={ 1.5 } aria-hidden />
            </TooltipTrigger>
            <TooltipContent
                side="bottom"
                className="max-w-[220px] text-center text-xs leading-[1.4]"
            >
                { text }
            </TooltipContent>
        </Tooltip>
    );
}
