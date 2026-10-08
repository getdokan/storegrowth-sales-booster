/**
 * Lucide icon for a module. The design uses one set in the feature menu and a
 * slightly different set on the dashboard, so both are mapped here.
 *
 * @since SPSG_VERSION
 */
import {
    BellRing,
    ChartBar,
    CreditCard,
    Eye,
    Gift,
    LayoutGrid,
    Package2,
    PanelTop,
    Percent,
    RectangleHorizontal,
    ShoppingBag,
    ShoppingCart,
    Timer,
    TrendingUp,
    Truck,
    type LucideIcon,
} from 'lucide-react';

const MENU_ICONS: Record< string, LucideIcon > = {
    'countdown-timer': Timer,
    'stock-bar': ChartBar,
    'sales-pop': BellRing,
    'progressive-discount-banner': Truck,
    'floating-notification-bar': RectangleHorizontal,
    bogo: Gift,
    'upsell-order-bump': CreditCard,
    'quick-view': Eye,
    'fly-cart': ShoppingCart,
    'direct-checkout': ShoppingBag,
};

const DASHBOARD_ICONS: Record< string, LucideIcon > = {
    ...MENU_ICONS,
    bogo: Percent,
    'upsell-order-bump': Package2,
    'stock-bar': TrendingUp,
    'floating-notification-bar': PanelTop,
    'direct-checkout': CreditCard,
};

export interface ModuleIconProps {
    /** Module id. */
    id: string;
    /** Which icon set to use. */
    variant?: 'menu' | 'dashboard';
    className?: string;
    strokeWidth?: number;
}

/**
 * Icon for a module; unknown modules get a generic grid icon.
 *
 * @since SPSG_VERSION
 *
 * @param props             Props.
 * @param props.id          Module id.
 * @param props.variant     Icon set: `menu` or `dashboard`.
 * @param props.className   Extra classes.
 * @param props.strokeWidth Lucide stroke width.
 */
export function ModuleIcon( {
    id,
    variant = 'menu',
    className,
    strokeWidth = 2,
}: ModuleIconProps ) {
    const icons = variant === 'dashboard' ? DASHBOARD_ICONS : MENU_ICONS;
    const Icon = icons[ id ] ?? LayoutGrid;

    return (
        <Icon className={ className } strokeWidth={ strokeWidth } aria-hidden />
    );
}
