/**
 * The BOGO offer badges (`bogo-icons-1..4`), as the storefront draws them
 * (`templates/bogo-offer-badge.php`); the admin shows the same artwork from
 * `assets/images/bogo/`.
 *
 * @since SPSG_VERSION
 */
import { __, sprintf } from '@wordpress/i18n';
import type { PickerIcon } from '@storegrowth/components';
import { assetUrl } from '@storegrowth/utilities';

/**
 * An image badge for the icon picker.
 *
 * @param name Stored value, e.g. `bogo-icons-1`.
 */
function badge( name: string ): PickerIcon {
    return function Badge( { className }: { className?: string } ) {
        return (
            <img
                src={ assetUrl( `images/bogo/${ name }.svg` ) }
                alt=""
                className={ `${ className ?? '' } object-contain` }
            />
        );
    };
}

export const BOGO_BADGES = [ 1, 2, 3, 4 ].map( ( index ) => {
    return {
        value: `bogo-icons-${ index }`,
        label: sprintf(
            /* translators: %d: badge number. */
            __( 'Badge %d', 'storegrowth-sales-booster' ),
            index
        ),
        Icon: badge( `bogo-icons-${ index }` ),
    };
} );
