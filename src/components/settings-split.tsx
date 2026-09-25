/**
 * Module settings frame (design `.split`): the settings column (512px) beside
 * the preview column. They stack when the frame itself is narrower than both
 * columns (512 + 420px): a container query, so it holds with the WordPress
 * menu and the feature rail beside it.
 *
 * `LivePreview` inside uses the same container for its stacked borders.
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
        <div className="@container w-full">
            <div className="flex w-full flex-wrap items-stretch">
                <div className="flex w-[512px] shrink-0 grow-0 basis-[512px] flex-col items-start gap-6 self-stretch rounded-l-lg border border-sg-cardline bg-white p-6 @max-[932px]:w-full @max-[932px]:flex-auto @max-[932px]:basis-full @max-[932px]:rounded-t-lg @max-[932px]:rounded-bl-none max-[782px]:p-4">
                    { children }
                </div>
                { preview && (
                    <div className="flex min-w-0 flex-auto basis-[420px] flex-col items-start @max-[932px]:w-full @max-[932px]:basis-full">
                        { preview }
                    </div>
                ) }
            </div>
        </div>
    );
}
