<?php
/**
 * Order Bump checkout block integration (step 11a).
 *
 * @package SBFW
 */

namespace StorePulse\StoreGrowth\Test\UpsellOrderBump;

use StorePulse\StoreGrowth\Interfaces\HookRegistry;
use StorePulse\StoreGrowth\Modules\UpsellOrderBump\Blocks\BlockRegistry;
use StorePulse\StoreGrowth\Modules\UpsellOrderBump\Blocks\OrderBumpCheckoutIntegration;
use StorePulse\StoreGrowth\Modules\UpsellOrderBump\UpsellOrderBumpModule;
use StorePulse\StoreGrowth\Test\StoreGrowthTestCase;

/**
 * The block integration is wired only while the module is active, and a
 * missing block build never fatals the cart / checkout blocks.
 *
 * @group upsell-order-bump
 */
class OrderBumpBlockTest extends StoreGrowthTestCase {

	/**
	 * The WooCommerce Blocks actions the registry hooks into.
	 *
	 * @var string[]
	 */
	const BLOCK_ACTIONS = [
		'woocommerce_blocks_mini-cart_block_registration',
		'woocommerce_blocks_cart_block_registration',
		'woocommerce_blocks_checkout_block_registration',
	];

	/**
	 * Script handle and integration name (ADR-004: unchanged).
	 *
	 * @var string
	 */
	const HANDLE = 'storegrowth-upsell-order-bump';

	/**
	 * Temporary asset file written by a test.
	 *
	 * @var string
	 */
	private $asset_file = '';

	/**
	 * Start every case without the block script registered.
	 *
	 * @return void
	 */
	public function setUp(): void {
		parent::setUp();
		wp_deregister_script( self::HANDLE );
	}

	/**
	 * Remove the script and any temporary asset file.
	 *
	 * @return void
	 */
	public function tearDown(): void {
		wp_deregister_script( self::HANDLE );

		if ( $this->asset_file && file_exists( $this->asset_file ) ) {
			unlink( $this->asset_file ); // phpcs:ignore WordPress.WP.AlternativeFunctions.unlink_unlink
		}

		parent::tearDown();
	}

	/**
	 * With the module off (the suite's default), nothing hooks the block
	 * registration actions and the registry isn't a loaded service.
	 *
	 * @return void
	 */
	public function test_module_off_registers_no_block_hooks(): void {
		$this->assertNotContains(
			UpsellOrderBumpModule::get_id(),
			(array) get_option( 'spsg_active_module_ids', [] ),
			'Precondition: Order Bump is inactive in the suite.'
		);

		foreach ( self::BLOCK_ACTIONS as $action ) {
			$this->assertFalse( has_action( $action ), "{$action} is hooked with the module off." );
		}

		$container = storegrowth_get_container();
		$hooks     = $container->has( HookRegistry::class ) ? $container->get( HookRegistry::class ) : [];

		foreach ( $hooks as $hook_registry ) {
			$this->assertNotInstanceOf( BlockRegistry::class, $hook_registry );
		}
	}

	/**
	 * The registry, once booted with the module, hooks all three blocks.
	 *
	 * @return void
	 */
	public function test_block_registry_hooks_the_three_blocks(): void {
		$registry = new BlockRegistry();
		$registry->register_hooks();

		foreach ( self::BLOCK_ACTIONS as $action ) {
			$this->assertSame( 10, has_action( $action, [ $registry, 'cart_checkout_block_support' ] ), $action );
		}
	}

	/**
	 * A missing build returns no handles (a handle that isn't registered
	 * would stop WooCommerce's block script from printing) and doesn't fatal.
	 *
	 * @return void
	 */
	public function test_missing_asset_returns_no_handles(): void {
		$integration = $this->integration( WP_CONTENT_DIR . '/spsg-missing/blocks.asset.php' );

		$this->assertSame( [], $integration->get_script_handles() );
		$this->assertSame( [], $integration->get_editor_script_handles() );
		$this->assertFalse( wp_script_is( self::HANDLE, 'registered' ) );
	}

	/**
	 * With the build present, the handle, its URL under `assets/js/` and
	 * the WooCommerce Blocks dependencies (registry, checkout, settings) are
	 * registered.
	 *
	 * @return void
	 */
	public function test_asset_present_registers_the_handle(): void {
		$this->asset_file = wp_tempnam( 'spsg-blocks-asset' );
		file_put_contents( // phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_file_put_contents
			$this->asset_file,
			"<?php return array( 'dependencies' => array( 'wp-element' ), 'version' => 'abc' );"
		);

		$integration = $this->integration( $this->asset_file );

		$this->assertSame( self::HANDLE, $integration->get_name() );
		$this->assertSame( [ self::HANDLE ], $integration->get_script_handles() );
		$this->assertSame( [ self::HANDLE ], $integration->get_editor_script_handles() );

		$script = wp_scripts()->registered[ self::HANDLE ];

		$this->assertSame( [ 'wc-blocks-registry', 'wc-blocks-checkout', 'wc-settings', 'wp-element' ], $script->deps );
		$this->assertSame( 'abc', $script->ver );
		$this->assertStringEndsWith( 'upsell-order-bump/assets/js/blocks.js', $script->src );
	}

	/**
	 * The real integration with its asset file pointed at `$asset_file`.
	 *
	 * @param string $asset_file Asset file path.
	 *
	 * @return OrderBumpCheckoutIntegration
	 */
	private function integration( string $asset_file ): OrderBumpCheckoutIntegration {
		return new class( $asset_file ) extends OrderBumpCheckoutIntegration {

			/**
			 * Asset file path.
			 *
			 * @var string
			 */
			private $test_asset_file;

			/**
			 * Constructor.
			 *
			 * @param string $asset_file Asset file path.
			 */
			public function __construct( string $asset_file ) {
				$this->test_asset_file = $asset_file;
			}

			/**
			 * Asset file path.
			 *
			 * @return string
			 */
			protected function get_asset_file(): string {
				return $this->test_asset_file;
			}
		};
	}
}
