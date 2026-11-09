<?php
/**
 * The site's clock.
 *
 * @package SBFW
 */

namespace StorePulse\StoreGrowth\Support;

use DateTimeImmutable;
use Exception;

// If this file is called directly, abort.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Answers "what time is it" and "is this window live" in the site timezone,
 * so every deal switches at the moment the merchant set.
 *
 * @since SPSG_VERSION
 */
class SiteTime {

	/**
	 * Stored weekday names, by ISO-8601 day number (`wp_date( 'N' )`).
	 *
	 * @since SPSG_VERSION
	 *
	 * @var array<int, string>
	 */
	const WEEKDAYS = [
		1 => 'monday',
		2 => 'tuesday',
		3 => 'wednesday',
		4 => 'thursday',
		5 => 'friday',
		6 => 'saturday',
		7 => 'sunday',
	];

	/**
	 * The current date and time in the site timezone.
	 *
	 * @since SPSG_VERSION
	 *
	 * @return DateTimeImmutable
	 */
	public static function now(): DateTimeImmutable {
		return current_datetime();
	}

	/**
	 * Today's weekday as schedules store it: lowercase English, whatever the
	 * site language (`wp_date( 'l' )` would translate it).
	 *
	 * @since SPSG_VERSION
	 *
	 * @param DateTimeImmutable|null $now Moment to read, the current one by default.
	 *
	 * @return string
	 */
	public static function weekday( ?DateTimeImmutable $now = null ): string {
		return self::WEEKDAYS[ (int) ( $now ?? self::now() )->format( 'N' ) ];
	}

	/**
	 * Read a stored date or date-time as a moment in the site timezone.
	 *
	 * A date without a time is the start of that day, or its last second
	 * with `$end_of_day`, so an end date runs through that day.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param mixed $value      Stored value (`Y-m-d` or `Y-m-d H:i:s`).
	 * @param bool  $end_of_day Whether a date without a time means the end of the day.
	 *
	 * @return DateTimeImmutable|null Null when empty or unreadable.
	 */
	public static function parse( $value, bool $end_of_day = false ): ?DateTimeImmutable {
		$value = is_string( $value ) ? trim( $value ) : '';

		if ( '' === $value || 0 === strpos( $value, '0000-00-00' ) ) {
			return null;
		}

		if ( preg_match( '/^\d{4}-\d{2}-\d{2}$/', $value ) ) {
			$value .= $end_of_day ? ' 23:59:59' : ' 00:00:00';
		}

		try {
			return new DateTimeImmutable( $value, wp_timezone() );
		} catch ( Exception $e ) {
			return null;
		}
	}

	/**
	 * Whether a moment falls inside a window. Both ends are inclusive; an
	 * empty or unreadable end leaves that side open.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param mixed                  $start Window start.
	 * @param mixed                  $end   Window end.
	 * @param DateTimeImmutable|null $now   Moment to check, the current one by default.
	 *
	 * @return bool
	 */
	public static function is_within( $start, $end, ?DateTimeImmutable $now = null ): bool {
		$now   = $now ?? self::now();
		$begin = self::parse( $start );
		$until = self::parse( $end, true );

		return ( null === $begin || $begin <= $now ) && ( null === $until || $now <= $until );
	}
}
