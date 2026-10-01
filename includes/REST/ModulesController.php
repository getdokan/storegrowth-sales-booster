<?php
/**
 * REST controller for the module list and module activation.
 *
 * @package StorePulse\StoreGrowth
 */

namespace StorePulse\StoreGrowth\REST;

use StorePulse\StoreGrowth\Interfaces\ModuleSkeleton;
use StorePulse\StoreGrowth\ModuleManager;
use WP_Error;
use WP_REST_Controller;
use WP_REST_Request;
use WP_REST_Response;
use WP_REST_Server;

defined( 'ABSPATH' ) || exit;

/**
 * Lists modules and turns them on or off for the admin UI.
 *
 * Routes:
 * - GET   sales-booster/v1/modules
 * - PATCH sales-booster/v1/modules/{id}   { status: bool }
 * - POST  sales-booster/v1/modules/batch  { ids: string[], status: bool }
 *
 * Activation goes through the module's own activate()/deactivate(), so the
 * `spsg_active_module_ids` option and the `spsg_module_activated` /
 * `spsg_module_deactivated` hooks behave exactly as with the admin-ajax path.
 *
 * @since SPSG_VERSION
 */
class ModulesController extends WP_REST_Controller {

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
	protected $rest_base = 'modules';

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
			'/' . $this->rest_base,
			[
				[
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => [ $this, 'get_items' ],
					'permission_callback' => [ $this, 'permissions_check' ],
				],
				'schema' => [ $this, 'get_public_item_schema' ],
			]
		);

		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base . '/batch',
			[
				[
					'methods'             => WP_REST_Server::CREATABLE,
					'callback'            => [ $this, 'batch_update' ],
					'permission_callback' => [ $this, 'permissions_check' ],
					'args'                => [
						'ids'    => [
							'description' => __( 'Module ids to update.', 'storegrowth-sales-booster' ),
							'type'        => 'array',
							'items'       => [ 'type' => 'string' ],
							'required'    => true,
						],
						'status' => [
							'description' => __( 'True to activate, false to deactivate.', 'storegrowth-sales-booster' ),
							'type'        => 'boolean',
							'required'    => true,
						],
					],
				],
			]
		);

		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base . '/(?P<id>[a-z0-9-]+)',
			[
				'args'   => [
					'id' => [
						'description' => __( 'Module id.', 'storegrowth-sales-booster' ),
						'type'        => 'string',
					],
				],
				[
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => [ $this, 'get_item' ],
					'permission_callback' => [ $this, 'permissions_check' ],
				],
				[
					'methods'             => WP_REST_Server::EDITABLE,
					'callback'            => [ $this, 'update_item' ],
					'permission_callback' => [ $this, 'permissions_check' ],
					'args'                => [
						'status' => [
							'description' => __( 'True to activate, false to deactivate.', 'storegrowth-sales-booster' ),
							'type'        => 'boolean',
							'required'    => true,
						],
					],
				],
				'schema' => [ $this, 'get_public_item_schema' ],
			]
		);
	}

	/**
	 * Only administrators may list or toggle modules.
	 *
	 * @since SPSG_VERSION
	 *
	 * @return bool
	 */
	public function permissions_check(): bool {
		return current_user_can( 'manage_options' );
	}

	/**
	 * All modules.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param WP_REST_Request $request Request object.
	 *
	 * @return WP_REST_Response
	 */
	public function get_items( $request ): WP_REST_Response {
		return rest_ensure_response( $this->manager()->list_all_modules() );
	}

	/**
	 * One module.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param WP_REST_Request $request Request object.
	 *
	 * @return WP_REST_Response|WP_Error
	 */
	public function get_item( $request ) {
		$module = $this->find_module( (string) $request['id'] );

		if ( is_wp_error( $module ) ) {
			return $module;
		}

		return rest_ensure_response( $this->prepare_module( $module ) );
	}

	/**
	 * Activate or deactivate one module.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param WP_REST_Request $request Request object.
	 *
	 * @return WP_REST_Response|WP_Error
	 */
	public function update_item( $request ) {
		$module = $this->find_module( (string) $request['id'] );

		if ( is_wp_error( $module ) ) {
			return $module;
		}

		$this->set_status( $module, rest_sanitize_boolean( $request['status'] ) );

		return rest_ensure_response( $this->prepare_module( $module ) );
	}

	/**
	 * Activate or deactivate several modules. Unknown ids fail the whole
	 * request before anything changes.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param WP_REST_Request $request Request object.
	 *
	 * @return WP_REST_Response|WP_Error
	 */
	public function batch_update( $request ) {
		$status  = rest_sanitize_boolean( $request['status'] );
		$modules = [];

		foreach ( (array) $request['ids'] as $id ) {
			$module = $this->find_module( sanitize_key( $id ) );

			if ( is_wp_error( $module ) ) {
				return $module;
			}

			$modules[] = $module;
		}

		foreach ( $modules as $module ) {
			$this->set_status( $module, $status );
		}

		return rest_ensure_response( array_map( [ $this, 'prepare_module' ], $modules ) );
	}

	/**
	 * Change a module's status only when it differs, so activate() doesn't
	 * append a duplicate id to the active list or boot the module twice.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param ModuleSkeleton $module Module.
	 * @param bool           $status True to activate.
	 *
	 * @return void
	 */
	private function set_status( ModuleSkeleton $module, bool $status ): void {
		if ( $status === $module->is_active() ) {
			return;
		}

		if ( $status ) {
			$module->activate();
		} else {
			$module->deactivate();
		}
	}

	/**
	 * Module by id, or a 404 error.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param string $id Module id.
	 *
	 * @return ModuleSkeleton|WP_Error
	 */
	private function find_module( string $id ) {
		$module = $this->manager()->get( $id );

		if ( ! $module ) {
			return new WP_Error(
				'spsg_module_not_found',
				/* translators: %s: module id. */
				sprintf( __( 'Module "%s" does not exist.', 'storegrowth-sales-booster' ), $id ),
				[ 'status' => 404 ]
			);
		}

		return $module;
	}

	/**
	 * Module as the admin UI consumes it; same shape as
	 * ModuleManager::list_all_modules().
	 *
	 * @since SPSG_VERSION
	 *
	 * @param ModuleSkeleton $module Module.
	 *
	 * @return array
	 */
	public function prepare_module( ModuleSkeleton $module ): array {
		foreach ( $this->manager()->list_all_modules() as $item ) {
			if ( $item['id'] === $module->get_id() ) {
				return $item;
			}
		}

		return [];
	}

	/**
	 * The shared module manager.
	 *
	 * @since SPSG_VERSION
	 *
	 * @return ModuleManager
	 */
	private function manager(): ModuleManager {
		return storegrowth_get_container()->get( ModuleManager::class );
	}

	/**
	 * Item schema.
	 *
	 * @since SPSG_VERSION
	 *
	 * @return array
	 */
	public function get_item_schema(): array {
		if ( $this->schema ) {
			return $this->add_additional_fields_schema( $this->schema );
		}

		$this->schema = [
			'$schema'    => 'http://json-schema.org/draft-04/schema#',
			'title'      => 'storegrowth-module',
			'type'       => 'object',
			'properties' => [
				'id'          => [
					'type'    => 'string',
					'context' => [ 'view', 'edit' ],
				],
				'name'        => [
					'type'    => 'string',
					'context' => [ 'view', 'edit' ],
				],
				'icon'        => [
					'type'    => 'string',
					'context' => [ 'view', 'edit' ],
				],
				'banner'      => [
					'type'    => 'string',
					'context' => [ 'view', 'edit' ],
				],
				'description' => [
					'type'    => 'string',
					'context' => [ 'view', 'edit' ],
				],
				'category'    => [
					'type'    => 'string',
					'context' => [ 'view', 'edit' ],
				],
				'status'      => [
					'type'    => 'boolean',
					'context' => [ 'view', 'edit' ],
				],
				'doc_link'    => [
					'type'    => 'string',
					'context' => [ 'view', 'edit' ],
				],
			],
		];

		return $this->add_additional_fields_schema( $this->schema );
	}
}
