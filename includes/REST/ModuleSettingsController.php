<?php
/**
 * REST controller for per-module settings.
 *
 * @package StorePulse\StoreGrowth
 */

namespace StorePulse\StoreGrowth\REST;

use StorePulse\StoreGrowth\Settings\SettingsService;
use WP_Error;
use WP_REST_Controller;
use WP_REST_Request;
use WP_REST_Response;
use WP_REST_Server;

defined( 'ABSPATH' ) || exit;

/**
 * GET/POST sales-booster/v1/settings/{module}
 *
 * Both return `{ schema, values }`: the module's fields (type, default, pro,
 * limits) and its current values. POST takes `{ values }`, validates them
 * against the schema and merges them into the module's existing option
 * (see SettingsService).
 *
 * Global plugin settings stay on `/settings` (SettingsController).
 *
 * @since SPSG_VERSION
 */
class ModuleSettingsController extends WP_REST_Controller {

	/**
	 * REST namespace.
	 *
	 * @since SPSG_VERSION
	 *
	 * @var string
	 */
	protected $namespace = 'sales-booster/v1';

	/**
	 * REST base.
	 *
	 * @since SPSG_VERSION
	 *
	 * @var string
	 */
	protected $rest_base = 'settings';

	/**
	 * Register the routes.
	 *
	 * @since SPSG_VERSION
	 *
	 * @return void
	 */
	public function register_routes(): void {
		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base . '/(?P<module>[a-z0-9-]+)',
			array(
				'args' => array(
					'module' => array(
						'description' => __( 'Module id.', 'storegrowth-sales-booster' ),
						'type'        => 'string',
					),
				),
				array(
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => array( $this, 'get_item' ),
					'permission_callback' => array( $this, 'permissions_check' ),
				),
				array(
					'methods'             => WP_REST_Server::CREATABLE,
					'callback'            => array( $this, 'update_item' ),
					'permission_callback' => array( $this, 'permissions_check' ),
					'args'                => array(
						'values' => array(
							'description' => __( 'Values keyed by setting key.', 'storegrowth-sales-booster' ),
							'type'        => 'object',
							'required'    => true,
						),
					),
				),
			)
		);
	}

	/**
	 * Only administrators may read or change module settings.
	 *
	 * @since SPSG_VERSION
	 *
	 * @return bool
	 */
	public function permissions_check(): bool {
		return current_user_can( 'manage_options' );
	}

	/**
	 * Return a module's schema and values.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param WP_REST_Request $request Request object.
	 *
	 * @return WP_REST_Response|WP_Error
	 */
	public function get_item( $request ) {
		$module_id = (string) $request->get_param( 'module' );

		if ( ! $this->service()->get_schema( $module_id ) ) {
			return $this->not_found();
		}

		return rest_ensure_response( $this->response_data( $module_id ) );
	}

	/**
	 * Save a module's values.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param WP_REST_Request $request Request object.
	 *
	 * @return WP_REST_Response|WP_Error
	 */
	public function update_item( $request ) {
		$module_id = (string) $request->get_param( 'module' );

		if ( ! $this->service()->get_schema( $module_id ) ) {
			return $this->not_found();
		}

		$saved = $this->service()->save( $module_id, (array) $request->get_param( 'values' ) );

		if ( is_wp_error( $saved ) ) {
			return $saved;
		}

		return rest_ensure_response( $this->response_data( $module_id ) );
	}

	/**
	 * `{ schema, values }` for a module.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param string $module_id Module id.
	 *
	 * @return array
	 */
	private function response_data( string $module_id ): array {
		return array(
			'schema' => (object) $this->service()->get_public_schema( $module_id ),
			'values' => (object) $this->service()->get_values( $module_id ),
		);
	}

	/**
	 * Error for an unknown module (or one without settings).
	 *
	 * @since SPSG_VERSION
	 *
	 * @return WP_Error
	 */
	private function not_found(): WP_Error {
		return new WP_Error(
			'spsg_settings_module_not_found',
			__( 'This module has no settings.', 'storegrowth-sales-booster' ),
			array( 'status' => 404 )
		);
	}

	/**
	 * The settings service.
	 *
	 * @since SPSG_VERSION
	 *
	 * @return SettingsService
	 */
	private function service(): SettingsService {
		return storegrowth_get_container()->get( SettingsService::class );
	}
}
