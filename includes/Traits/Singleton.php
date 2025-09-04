<?php
/**
 * Singleton trait.
 *
 * @package WPBP
 */

namespace StorePulse\StoreGrowth\Traits;

// If this file is called directly, abort.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Trait to make a class singleton.
 */
trait Singleton {

	/**
	 * Object container.
	 *
	 * @var self
	 */
	private static $object;

	/**
	 * Create object of this class.
	 *
	 * @return self
	 */
	public static function instance() {
		if ( static::$object ) {
			return static::$object;
		}

		static::$object = new static();

		return static::$object;
	}

	/**
	 * Cloning is forbidden.
	 *
	 * @since 2.1
	 */
	public function __clone() {
		wp_die( 'Cloning is forbidden.' );
	}

	/**
	 * Unserializing instances of this class is forbidden.
	 *
	 * @since 2.1
	 */
	public function __wakeup() {
		wp_die( 'Unserializing instances of this class is forbidden.' );
	}
}
