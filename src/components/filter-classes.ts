/**
 * Classes for the controls of a report's filter bar (date range, selects,
 * toggles, buttons), so they all look alike: 40px tall, white, a neutral
 * border and regular text. plugin-ui's defaults differ per control (a
 * select is 36px, an outline button is brand blue, a pressed toggle grey).
 *
 * Pro's controls use these too: Tailwind scans StoreGrowth's sources only,
 * so the classes exist because they're written here.
 *
 * @since 3.0.0
 */
export const FILTER_CLASSES = {
    /** `SelectTrigger` (beats plugin-ui's `data-[size=default]:h-9`). */
    select: 'h-10 data-[size=default]:h-10 min-w-[180px] border-input bg-white ps-4 pe-4 font-normal text-sg-text',
    /** A `Button` (e.g. a menu trigger) with `variant="outline"`. */
    button: 'h-10 border-input bg-white px-4 font-normal text-sg-text hover:bg-sg-chip hover:text-sg-text',
    /** A `Toggle` with `variant="outline"`; pressed in the brand's soft tint. */
    toggle: 'h-10 border-input bg-white px-4 font-normal text-sg-text hover:bg-sg-chip hover:text-sg-text aria-pressed:border-sg-brand aria-pressed:bg-sg-brand-soft aria-pressed:text-sg-brand aria-pressed:hover:bg-sg-brand-soft',
    /** `DateRangePicker`'s trigger. */
    picker: 'h-10 bg-white font-normal text-sg-text',
} as const;
