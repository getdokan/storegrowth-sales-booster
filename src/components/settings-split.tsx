/**
 * Module settings frame (design `.split`): the settings column (512px) beside
 * the preview column; they stack below 1100px.
 *
 * @since SPSG_VERSION
 */
import type { ReactNode } from 'react';

export interface SettingsSplitProps {
    /** Settings column: usually `SettingsTabs`. */
    children: ReactNode;
    /** Preview column: usually `LivePreview`. */
    preview?: ReactNode;
}

/**
 * @since SPSG_VERSION
 *
 * @param props          Props.
 * @param props.children Settings column.
 * @param props.preview  Preview column.
 */
export function SettingsSplit( { children, preview }: SettingsSplitProps ) {
    return (
        <div className="flex w-full flex-wrap items-stretch">
            <div className="flex w-[512px] shrink-0 grow-0 basis-[512px] flex-col items-start gap-6 self-stretch rounded-l-lg border border-[#EAEAEA] bg-white p-6 max-[1100px]:w-full max-[1100px]:flex-auto max-[1100px]:basis-full max-[1100px]:rounded-t-lg max-[1100px]:rounded-bl-none max-[782px]:p-4">
                { children }
            </div>
            { preview && (
                <div className="flex min-w-0 flex-auto basis-[420px] flex-col items-start max-[1100px]:w-full max-[1100px]:basis-full">
                    { preview }
                </div>
            ) }
        </div>
    );
}
