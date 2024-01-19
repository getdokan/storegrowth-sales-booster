<?php
/**
 * Common_Hooks class for `Stock Bar` module.
 *
 * @package SBFW
 */

namespace STOREGROWTH\SPSB\Modules\QuickView\Includes;

use STOREGROWTH\SPSB\Traits\Singleton;

// If this file is called directly, abort.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Miscellaneous hooks implementation.
 */
class CommonHooks {

	use Singleton;

	/**
	 * Constructor of Common_Hooks class.
	 */
	private function __construct() {
		add_filter( 'woocommerce_loop_add_to_cart_link', array( $this, 'show_quick_view_button_shop' ), 15 );
		// ajax
		add_action( 'wp_ajax_woosq_quickview', array( $this, 'ajax_quickview' ) );
		add_action( 'wp_ajax_nopriv_woosq_quickview', array( $this, 'ajax_quickview' ) );
		add_action( 'wp_footer', array( $this, 'footer' ) );
	}

		/**
		 * Hook for WooCommerce loop add to cart link.
		 *
		 * @since 1.0.0
		 *
		 * @param string $add_to_cart Add to cart link.
		 *
		 * @return string
		 */
	public function show_quick_view_button_shop( $add_to_cart ) {
			ob_start();
			$this->display_buy_now_button();
			$buy_now_button = ob_get_contents();
			ob_end_clean();

			$add_to_cart .= $buy_now_button;

		return $add_to_cart;
	}

		/**
		 * Function to display the Buy Now button.
		 */
	private function display_buy_now_button() {
		global $product;

		$product_id                    = get_the_ID();
		$direct_checkout_button_layout = get_post_meta( $product_id, '_sgsb_direct_checkout_button_layout', true );
		$settings                      = get_option( 'sgsb_quick_view_settings' );
	

		include __DIR__ . '/../templates/quick-view-button.php';
	}
	public function footer() {
				echo '<div id="woosq-popup" class="woosq-sidebar woosq-position-01 woosq-heading-no"></div>';
				echo '<div class="woosq-overlay"></div>';
	}

	function ajax_quickview() {
		global $product;

		$product_id    = get_the_ID();
		$settings      = get_option( 'sgsb_quick_view_settings' );
		$view_settings = sgsb_find_option_setting( $settings, 'view', 'popup' );
		$view_settings = sgsb_find_option_setting( $settings, 'content_image', 'product_image' );

		if ( ! apply_filters( 'woosq_disable_security_check', false ) ) {
			check_ajax_referer( 'woosq-security', 'nonce' );
		}

		global $post, $product;
		$product_id = absint( sanitize_key( $_REQUEST['product_id'] ) );
		$product    = wc_get_product( $product_id );

		if ( $product ) {
			$post = get_post( $product_id );
			setup_postdata( $post );
			$thumb_ids = array();

			if ( self::get_setting( 'content_image', 'all' ) === 'product_image' ) {
				if ( $product_image = $product->get_image_id() ) {
					$thumb_ids[] = $product_image;
				}

				if ( $product->is_type( 'variable' ) && ( $children = $product->get_visible_children() ) ) {
					foreach ( $children as $child ) {
						if ( ( $child_product = wc_get_product( $child ) ) && ( $child_product_image = $child_product->get_image_id() ) ) {
							$thumb_ids[] = $child_product_image;
						}
					}
				}
			} else {
				if ( self::get_setting( 'content_image', 'all' ) === 'all' ) {
					if ( $product_image = $product->get_image_id() ) {
						$thumb_ids[] = $product_image;
					}

					if ( $product->is_type( 'variable' ) && ( $children = $product->get_visible_children() ) ) {
						foreach ( $children as $child ) {
							if ( ( $child_product = wc_get_product( $child ) ) && ( $child_product_image = $child_product->get_image_id() ) ) {
								$thumb_ids[] = $child_product_image;
							}
						}
					}
				}

				if ( is_a( $product, 'WC_Product_Variation' ) ) {
					// get images from WPC Additional Variation Images
					$_images = array_filter( explode( ',', get_post_meta( $product_id, 'wpcvi_images', true ) ) );

					if ( ! empty( $_images ) ) {
						$thumb_ids = array_merge( $thumb_ids, $_images );
					}
				} else {
					$thumb_ids = array_merge( $thumb_ids, $product->get_gallery_image_ids() );
				}
			}

			$thumb_ids = apply_filters( 'woosq_thumbnails', $thumb_ids, $product );
			$thumb_ids = array_unique( $thumb_ids );

			if ( self::get_setting( 'view', 'popup' ) === 'popup' ) {
				echo '<div id="woosq-popup" class="woosq-popup mfp-with-anim ' . esc_attr( self::get_setting( 'content_view_details_button', 'no' ) === 'yes' ? 'view-details' : '' ) . '">';
			} elseif ( self::get_setting( 'sidebar_heading', 'no' ) === 'yes' ) {
					echo '<div class="woosq-sidebar-heading"><span class="woosq-heading">' . esc_html( $product->get_name() ) . '</span><span class="woosq-close"> &times; </span></div>';
			} else {
				echo '<span class="woosq-close"> &times; </span>';
			}
			?>
									<div class="woocommerce single-product woosq-product">
											<div id="product-<?php echo esc_attr( $product_id ); ?>" <?php wc_product_class( '', $product ); ?>>
													<div class="thumbnails">
						<?php
						do_action( 'woosq_before_thumbnails', $product );

						echo '<div class="images">';

						$image_sz = apply_filters( 'woosq_image_size', 'default' );

						if ( $image_sz === 'default' ) {
							$image_size = self::get_setting( 'image_size', 'woosq' );
						} else {
							$image_size = $image_sz;
						}

						if ( ! empty( $thumb_ids ) ) {
							foreach ( $thumb_ids as $thumb_id ) {
								if ( self::get_setting( 'content_image_lightbox', 'no' ) !== 'no' ) {
									$image_full = wp_get_attachment_image_src( $thumb_id, 'full' );

									echo '<div class="thumbnail" data-id="' . $thumb_id . '">' . wp_get_attachment_image(
										$thumb_id,
										$image_size,
										false,
										array(
											'data-fancybox' => 'gallery',
											'data-src' => esc_url( $image_full[0] ),
										)
									) . '</div>';
								} else {
									echo '<div class="thumbnail" data-id="' . $thumb_id . '">' . wp_get_attachment_image( $thumb_id, $image_size ) . '</div>';
								}
							}
						} else {
							echo '<div class="thumbnail">' . wc_placeholder_img( $image_size ) . '</div>';
						}

						echo '</div>';

						do_action( 'woosq_after_thumbnails', $product );
						?>
													</div>
													<div class="summary entry-summary">
						<?php do_action( 'woosq_before_summary', $product ); ?>

															<div class="summary-content">
							<?php do_action( 'woosq_product_summary', $product ); ?>
															</div>

						<?php do_action( 'woosq_after_summary', $product ); ?>
													</div>
											</div>
									</div><!-- /woocommerce single-product -->
			<?php
			// if ( self::get_setting( 'content_view_details_button', 'no' ) === 'yes' ) {
			// $view_details_text = self::localization( 'view_details', esc_html__( 'View product details', 'woo-smart-quick-view' ) );

			// echo sprintf( '<a class="view-details-btn" href="%s">%s</a>', $product->get_permalink(), esc_html( $view_details_text ) );
			// }

			if ( $view_settings === 'popup' ) {
				echo '</div><!-- #woosq-popup -->';
			}

			wp_reset_postdata();
		}

		wp_die();
	}
}
