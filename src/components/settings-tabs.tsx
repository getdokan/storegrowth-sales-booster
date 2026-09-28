/**
 * Settings tabs (design `.tabs` / `.tab`): grey pill with white selected tab,
 * a rule, then the selected panel. plugin-ui's Tabs handle the keyboard and
 * the tab/panel ARIA.
 *
 * @since SPSG_VERSION
 */
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@wedevs/plugin-ui';
import type { ReactNode } from 'react';

export interface SettingsTab {
    id: string;
    label: ReactNode;
    content: ReactNode;
}

export interface SettingsTabsProps {
    tabs: SettingsTab[];
    /** Accessible name of the tab list, e.g. "Stock Bar settings". */
    label: string;
    /** Initially selected tab id (default: the first). */
    defaultTab?: string;
    /** Selected tab id, when the page controls it (e.g. from the URL). */
    value?: string;
    /** Tab selected by the user, with `value`. */
    onValueChange?: ( id: string ) => void;
}

/**
 * @since SPSG_VERSION
 *
 * @param props               Props.
 * @param props.tabs          Tabs with their panels.
 * @param props.label         Accessible name of the tab list.
 * @param props.defaultTab    Initially selected tab id.
 * @param props.value         Selected tab id (controlled).
 * @param props.onValueChange Tab selected by the user.
 */
export function SettingsTabs( {
    tabs,
    label,
    defaultTab,
    value,
    onValueChange,
}: SettingsTabsProps ) {
    return (
        <Tabs
            defaultValue={ defaultTab ?? tabs[ 0 ]?.id }
            value={ value }
            onValueChange={ ( next: unknown ) => {
                onValueChange?.( String( next ) );
            } }
            className="w-full gap-6"
        >
            <TabsList
                aria-label={ label }
                // Scrolls sideways when the tabs don't fit (a narrow screen).
                className="h-auto max-w-full gap-2 overflow-x-auto rounded-lg bg-sg-chip p-1"
            >
                { tabs.map( ( tab ) => (
                    <TabsTrigger
                        key={ tab.id }
                        value={ tab.id }
                        className="h-auto flex-none gap-2 rounded-md border-0 px-4 py-2 leading-5 text-sg-tertiary hover:text-sg-text data-active:bg-white data-active:text-sg-brand data-active:shadow-[0_1px_1px_rgba(0,0,0,.05),0_2px_1px_rgba(0,0,0,.05)]"
                    >
                        { tab.label }
                    </TabsTrigger>
                ) ) }
            </TabsList>
            { tabs.map( ( tab ) => (
                <TabsContent
                    key={ tab.id }
                    value={ tab.id }
                    className="flex w-full flex-col items-start gap-3"
                >
                    <div className="h-px w-full bg-sg-line" />
                    { tab.content }
                </TabsContent>
            ) ) }
        </Tabs>
    );
}
