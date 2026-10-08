/**
 * StoreGrowth admin header on plugin-ui's TopBar: logo, version badges,
 * What's New, Support and (without pro) Upgrade. Data comes from PHP
 * (`spsgAdminHeader`, filterable there).
 *
 * @since SPSG_VERSION
 */
import { TopBar } from '@wedevs/plugin-ui';
import { __, sprintf } from '@wordpress/i18n';
import { Headset, Megaphone } from 'lucide-react';

const LINK_CLASS =
    'flex shrink-0 items-center gap-2 whitespace-nowrap text-[14px] leading-[1.4] text-sg-slate no-underline hover:text-sg-brand focus:shadow-none';

export default function AdminBar() {
    const settings = window.spsgAdminHeader;
    const info = settings.header_info;

    const versions = [
        {
            version: `v${ info.lite_version }`,
            isPro: false,
            className:
                'rounded-[20px]! border-0! bg-[#EFEAFF]! px-3! py-1.5! text-[12px]! text-[#181894]! max-[560px]:hidden!',
        },
        ...( info.is_pro_exists && info.pro_version
            ? [
                  {
                      version: sprintf(
                          /* translators: %s: StoreGrowth Pro version. */
                          __( 'Pro v%s', 'storegrowth-sales-booster' ),
                          info.pro_version
                      ),
                      isPro: true,
                      className: 'rounded-[20px]! max-[560px]:hidden!',
                  },
              ]
            : [] ),
    ];

    return (
        <TopBar
            className="max-h-none items-center bg-white px-4 py-3 shadow-[0_1px_0_0_#E9E9E9] wpsm:px-8 md:py-4"
            logo={
                <a href={ settings.dashboard_url } className="block">
                    <img
                        className="block h-auto w-[124px] wpsm:w-[140px]"
                        src={ settings.logo_url }
                        alt={ __( 'StoreGrowth', 'storegrowth-sales-booster' ) }
                    />
                </a>
            }
            versions={ versions }
            rightSideComponents={
                <div className="flex shrink-0 items-center gap-4 sm:gap-8">
                    <a
                        href={ info.whats_new_url }
                        target="_blank"
                        rel="noopener noreferrer"
                        className={ LINK_CLASS }
                    >
                        <Megaphone
                            className="h-5 w-5 text-sg-brand"
                            strokeWidth={ 1.5 }
                            aria-hidden
                        />
                        <span className="max-[900px]:hidden">
                            { __( 'What’s New', 'storegrowth-sales-booster' ) }
                        </span>
                    </a>
                    <a
                        href={ info.support_url }
                        target="_blank"
                        rel="noopener noreferrer"
                        className={ LINK_CLASS }
                    >
                        <Headset
                            className="h-5 w-5 text-sg-brand"
                            strokeWidth={ 1.5 }
                            aria-hidden
                        />
                        <span className="max-[900px]:hidden">
                            { __( 'Support', 'storegrowth-sales-booster' ) }
                        </span>
                    </a>
                    { ! info.is_pro_exists && (
                        <TopBar.UpgradeBtn
                            className="h-9 border-0! bg-sg-amber px-5 font-medium text-black hover:bg-sg-amber-hover"
                            onClick={ () =>
                                window.open(
                                    info.upgrade_url,
                                    '_blank',
                                    'noopener,noreferrer'
                                )
                            }
                        >
                            { __( 'Upgrade', 'storegrowth-sales-booster' ) }
                        </TopBar.UpgradeBtn>
                    ) }
                </div>
            }
        />
    );
}
