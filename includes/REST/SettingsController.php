<?php
/**
 * REST controller for global plugin settings.
 *
 * @package StorePulse\StoreGrowth
 */

namespace StorePulse\StoreGrowth\REST;

use StorePulse\StoreGrowth\Uninstaller;
use WP_REST_Controller;
use WP_REST_Request;
use WP_REST_Response;
use WP_REST_Server;

defined( 'ABSPATH' ) || exit;

/**
 * Exposes the plugin-wide settings the admin UI reads and writes.
 *
 * Currently a single setting: whether uninstalling the plugin removes its
 * data. Kept as its own controller so more global settings can join it.
 *
 * @since 2.2.0
 */
class SettingsController extends WP_REST_Controller {

	/**
	 * REST namespace.
	 *
	 * @var string
	 */
	protected $namespace = 'sales-booster/v1';

	/**
	 * REST base.
	 *
	 * @var string
	 */
	protected $rest_base = 'settings';

	/**
	 * Register the routes.
	 *
	 * @since 2.2.0
	 *
	 * @return void
	 */
	public function register_routes(): void {
		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base,
			array(
				array(
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => array( $this, 'get_item' ),
					'permission_callback' => array( $this, 'permissions_check' ),
				),
				array(
					'methods'             => WP_REST_Server::CREATABLE,
					'callback'            => array( $this, 'update_item' ),
					'permission_callback' => array( $this, 'permissions_check' ),
					'args'                => $this->get_endpoint_args_for_item_schema( WP_REST_Server::CREATABLE ),
				),
				'schema' => array( $this, 'get_public_item_schema' ),
			)
		);
	}

	/**
	 * Only administrators may read or change global plugin settings.
	 *
	 * @since 2.2.0
	 *
	 * @return bool
	 */
	public function permissions_check(): bool {
		return current_user_can( 'manage_options' );
	}

	/**
	 * Return the current settings.
	 *
	 * @since 2.2.0
	 *
	 * @param WP_REST_Request $request Request object.
	 *
	 * @return WP_REST_Response
	 */
	public function get_item( $request ): WP_REST_Response {
		return rest_ensure_response( $this->current_settings() );
	}

	/**
	 * Persist the settings sent from the UI.
	 *
	 * @since 2.2.0
	 *
	 * @param WP_REST_Request $request Request object.
	 *
	 * @return WP_REST_Response
	 */
	public function update_item( $request ): WP_REST_Response {
		if ( null !== $request->get_param( 'remove_data_on_uninstall' ) ) {
			// Not autoloaded: this is read by this route and by the uninstaller,
			// never on an ordinary page load.
			update_option(
				Uninstaller::DATA_REMOVAL_OPTION,
				rest_sanitize_boolean( $request->get_param( 'remove_data_on_uninstall' ) ),
				false
			);
		}

		return rest_ensure_response( $this->current_settings() );
	}

	/**
	 * The settings as the UI consumes them.
	 *
	 * @since 2.2.0
	 *
	 * @return array
	 */
	private function current_settings(): array {
		return array(
			'remove_data_on_uninstall' => (bool) get_option( Uninstaller::DATA_REMOVAL_OPTION, false ),
		);
	}

	/**
	 * Item schema.
	 *
	 * @since 2.2.0
	 *
	 * @return array
	 */
	public function get_item_schema(): array {
		if ( $this->schema ) {
			return $this->add_additional_fields_schema( $this->schema );
		}

		$this->schema = array(
			'$schema'    => 'http://json-schema.org/draft-04/schema#',
			'title'      => 'settings',
			'type'       => 'object',
			'properties' => array(
				'remove_data_on_uninstall' => array(
					'description' => __( 'Whether uninstalling the plugin removes all of its data.', 'storegrowth-sales-booster' ),
					'type'        => 'boolean',
					'context'     => array( 'view', 'edit' ),
				),
			),
		);

		return $this->add_additional_fields_schema( $this->schema );
	}
}
