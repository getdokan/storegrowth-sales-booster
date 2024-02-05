<?php
/**
 * Ajax class for `Stock Bar` module.
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
 * Add ajax actions inside this class.
 */
class Ajax {

	use Singleton;

	/**
	 * Constructor of Ajax class.
	 */
	private function __construct() {
		add_action( 'wp_ajax_sgsb_quick_view_save_settings', array( $this, 'save_settings' ) );
		add_action( 'wp_ajax_sgsb_quick_view_get_settings', array( $this, 'get_settings' ) );
		add_action( 'wp_ajax_sgsbqcv_quickview', array( $this, 'ajax_quickview_callback' ) );
		add_action( 'wp_ajax_nopriv_sgsbqcv_quickview', array( $this, 'ajax_quickview_callback' ) );
		add_action( 'wp_ajax_custom_ajax_add_to_cart', array( $this, 'custom_ajax_add_to_cart' ) );
		add_action( 'wp_ajax_nopriv_custom_ajax_add_to_cart', array( $this, 'custom_ajax_add_to_cart' ) );
		// add_action( 'wp_ajax_load_modal_template', array( $this, 'load_modal_template_callback' ) );
		// add_action( 'wp_ajax_nopriv_load_modal_template', array( $this, 'load_modal_template_callback' ) );
	}

	/**
	 * Ajax action for save settings
	 */
	public function save_settings() {
		check_ajax_referer( 'sgsb_ajax_nonce' );

		if ( ! isset( $_POST['form_data'] ) ) {
			wp_send_json_error();
		}

		// phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized -- Sanitizing via `sgsb_sanitize_form_fields`.
		$form_data = array_map( 'sgsb_sanitize_form_fields', wp_unslash( $_POST['form_data'] ) );

		update_option( 'sgsb_quick_view_settings', $form_data );

		wp_send_json_success();
	}

	/**
	 * Ajax action for get settings.
	 */
	public function get_settings() {
		check_ajax_referer( 'sgsb_ajax_nonce' );

		$form_data = get_option( 'sgsb_quick_view_settings', array() );

		wp_send_json_success( $form_data );
	}



	public function ajax_quickview_callback() {
		check_ajax_referer( 'sgsbqcv-security', 'nonce' );

		global $post, $product;
		$product_id                  = absint( sanitize_key( $_REQUEST['product_id'] ) );
		$product                     = wc_get_product( $product_id );
		$content_image               = 'all';
		$content_view_details_button = 'no';
		$content_image_lightbox      = 'no';
		$view                        = 'popup';
		$sidebar_heading             = 'no';

		if ( $product ) {
			$post = get_post( $product_id );
			setup_postdata( $post );
			$thumb_ids = array();

			if ( $content_image === 'product_image' ) {
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
				if ( $content_image === 'all' ) {
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

			$thumb_ids = apply_filters( 'sgsbqcv_thumbnails', $thumb_ids, $product );
			$thumb_ids = array_unique( $thumb_ids );
			error_log( print_r( $thumb_ids, 1 ) );

			if ( $view === 'popup' ) {
				echo '<div id="sgsbqcv-popup" class="sgsbqcv-popup mfp-with-anim ' . esc_attr( $content_view_details_button === 'yes' ? 'view-details' : '' ) . '">';
			} elseif ( $sidebar_heading === 'yes' ) {
					echo '<div class="sgsbqcv-sidebar-heading"><span class="sgsbqcv-heading">' . esc_html( $product->get_name() ) . '</span><span class="sgsbqcv-close"> &times; </span></div>';
			} else {
				echo '<span class="sgsbqcv-close"> &times; </span>';
			}
			?>
			<div class="woocommerce single-product sgsbqcv-product">
				<div id="product-<?php echo esc_attr( $product_id ); ?>" <?php wc_product_class( '', $product ); ?>>
					<div class="thumbnails">
						<?php
						do_action( 'sgsbqcv_before_thumbnails', $product );

						echo '<div class="images">';

						$image_sz = apply_filters( 'sgsbqcv_image_size', 'default' );

						if ( $image_sz === 'default' ) {
							$image_size = 'sgsbqcv';
						} else {
							$image_size = $image_sz;
						}

						if ( ! empty( $thumb_ids ) ) {
							foreach ( $thumb_ids as $thumb_id ) {
								if ( $content_image_lightbox !== 'no' ) {
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

						do_action( 'sgsbqcv_after_thumbnails', $product );
						?>
					</div>
					<div class="summary entry-summary">
						<?php do_action( 'sgsbqcv_before_summary', $product ); ?>

						<div class="summary-content">
							<?php do_action( 'sgsbqcv_product_summary', $product ); ?>
						</div>

						<?php do_action( 'sgsbqcv_after_summary', $product ); ?>
					</div>
				</div>
			</div><!-- /woocommerce single-product -->
			<?php
			if ( $content_view_details_button === 'yes' ) {
				$view_details_text = self::localization( 'view_details', esc_html__( 'View product details', 'woo-smart-quick-view' ) );

				echo sprintf( '<a class="view-details-btn" href="%s">%s</a>', $product->get_permalink(), esc_html( $view_details_text ) );
			}

			if ( $view === 'popup' ) {
				echo '</div><!-- #sgsbqcv-popup -->';
			}

			wp_reset_postdata();
		}

		wp_die();
	}

	public function custom_ajax_add_to_cart() {
		$product_id = $_POST['product_id'];
		$quantity   = $_POST['quantity'];
		error_log( $product_id );
		WC()->cart->add_to_cart( $product_id, $quantity );
		wp_die();
	}
}
