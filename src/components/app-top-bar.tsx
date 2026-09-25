/**
 * Plugin top bar (design `.plugin-topbar`): logo, version pill, What's New,
 * Support and the amber Upgrade button. Built on plugin-ui's TopBar, restyled
 * to the design.
 *
 * @since SPSG_VERSION
 */
import { TopBar } from '@wedevs/plugin-ui';
import { __ } from '@wordpress/i18n';
import { Crown, Headset, Megaphone } from 'lucide-react';
import { assetUrl, getAdminData } from '@storegrowth/utilities';
import { navigate } from '@storegrowth/hooks';

/**
 * @since SPSG_VERSION
 */
export function AppTopBar() {
    const { version, isPro, urls } = getAdminData();

    const linkClass =
        'flex shrink-0 items-center gap-2 whitespace-nowrap text-[14px] leading-[1.4] text-sg-slate no-underline hover:text-sg-brand focus:shadow-none';

    return (
        <TopBar
            className="max-h-none flex-wrap items-center gap-x-4 gap-y-3 bg-white px-4 py-3 shadow-[0_1px_0_0_#E9E9E9] wpsm:px-8 wpsm:py-4 md:py-4"
            logo={
                <a
                    href="#/dashboard"
                    onClick={ ( event ) => {
                        event.preventDefault();
                        navigate( '/dashboard' );
                    } }
                    className="block"
                >
                    <img
                        src={ assetUrl( 'images/storegrowth-logo.svg' ) }
                        alt={ __( 'StoreGrowth', 'storegrowth-sales-booster' ) }
                        className="block h-auto w-[124px] wpsm:w-[140px]"
                    />
                </a>
            }
            versions={
                version
                    ? [
                          {
                              version: `v${ version }`,
                              isPro: false,
                              className:
                                  'h-auto! rounded-[20px]! border-0! bg-[#EFEAFF]! px-3! py-1.5! text-[12px]! leading-[1.4]! text-[#181894]! max-[560px]:hidden!',
                          },
                      ]
                    : []
            }
            rightSideComponents={
                <div className="flex shrink-0 items-center gap-4 sm:gap-8">
                    <a
                        href={ urls.whatsNew }
                        target="_blank"
                        rel="noreferrer"
                        className={ linkClass }
                    >
                        <Megaphone
                            className="h-5 w-5 text-sg-brand"
                            strokeWidth={ 1.5 }
                            aria-hidden
                        />
                        <span className="hidden min-[901px]:inline">
                            { __( 'What’s New', 'storegrowth-sales-booster' ) }
                        </span>
                    </a>
                    <a
                        href={ urls.support }
                        target="_blank"
                        rel="noreferrer"
                        className={ linkClass }
                    >
                        <Headset
                            className="h-5 w-5 text-sg-brand"
                            strokeWidth={ 1.5 }
                            aria-hidden
                        />
                        <span className="hidden min-[901px]:inline">
                            { __( 'Support', 'storegrowth-sales-booster' ) }
                        </span>
                    </a>
                    { ! isPro && (
                        <a
                            href={ urls.upgrade }
                            target="_blank"
                            rel="noreferrer"
                            className="flex shrink-0 items-center gap-[7px] rounded-[6px] bg-sg-amber px-5 py-2 text-[14px] font-medium leading-5 text-black no-underline transition-colors hover:bg-sg-amber-hover hover:text-black focus:shadow-none"
                        >
                            <span className="whitespace-nowrap">
                                { __( 'Upgrade', 'storegrowth-sales-booster' ) }
                            </span>
                            <Crown
                                className="h-4 w-4"
                                strokeWidth={ 1.5 }
                                aria-hidden
                            />
                        </a>
                    ) }
                </div>
            }
        />
    );
}
