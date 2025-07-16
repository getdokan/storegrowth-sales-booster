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

	/**
	 * Quick view Ajax call.
	 */
	public function ajax_quickview_callback() {
		check_ajax_referer( 'sgsbqcv-security', 'nonce' );

		global $post, $product;
		$settings = get_option( 'sgsb_quick_view_settings' );

		$product_id                  = isset( $_REQUEST['product_id'] ) ? absint( sanitize_key( $_REQUEST['product_id'] ) ) : '';
		$product                     = wc_get_product( $product_id );
		$content_image               = 'all';
		$content_view_details_button = sgsb_find_option_setting( $settings, 'show_view_details_button', false );
		$content_image_lightbox      = 'no';

		if ( $product ) {

			$post = get_post( $product_id );
			setup_postdata( $post );
			$thumb_ids = array();

			if ( 'product_image' === $content_image ) {
				$product_image = $product->get_image_id();
				if ( $product_image ) {
					$thumb_ids[] = $product_image;
				}
				$children = $product->get_visible_children();
				if ( $product->is_type( 'variable' ) && ( $children ) ) {
					foreach ( $children as $child ) {
						$child_product       = wc_get_product( $child );
						$child_product_image = $child_product->get_image_id();
						if ( $child_product && $child_product_image ) {
							$thumb_ids[] = $child_product_image;
						}
					}
				}
			} else {
				if ( 'all' === $content_image ) {

					if ( $product->get_image_id() ) {
						$product_image = $product->get_image_id();
						$thumb_ids[]   = $product_image;
					}

					if ( $product->is_type( 'variable' ) && ( $product->get_visible_children() ) ) {
						$children = $product->get_visible_children();
						foreach ( $children as $child ) {
							$child_product       = wc_get_product( $child );
							$child_product_image = $child_product->get_image_id();

							if ( $child_product && ( $child_product_image ) ) {
								$thumb_ids[] = $child_product_image;
							}
						}
					}
				}

				if ( is_a( $product, 'WC_Product_Variation' ) ) {
					// get images from WPC Additional Variation Images.
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

				echo '<div id="sgsbqcv-popup" class="sgsbqcv-popup mfp-with-anim ' . esc_attr( $content_view_details_button ? 'view-details' : '' ) . '">';
			?>
			<div class="woocommerce single-product sgsbqcv-product">
				<div id="product-<?php echo esc_attr( $product_id ); ?>" <?php wc_product_class( '', $product ); ?>>
					<div class="thumbnails">
						<?php
						do_action( 'sgsbqcv_before_thumbnails', $product );

						echo '<div class="images">';

						$image_sz = apply_filters( 'sgsbqcv_image_size', 'default' );

						if ( 'default' === $image_sz ) {
							$image_size = 'sgsbqcv';
						} else {
							$image_size = $image_sz;
						}

						if ( ! empty( $thumb_ids ) ) {
							foreach ( $thumb_ids as $thumb_id ) {
								if ( 'no' !== $content_image_lightbox ) {
									$image_full = wp_get_attachment_image_src( $thumb_id, 'full' );

									echo '<div class="thumbnail" data-id="' . esc_attr( $thumb_id ) . '">' . wp_get_attachment_image(
										$thumb_id,
										$image_size,
										false,
										array(
											'data-fancybox' => 'gallery',
											'data-src' => esc_url( $image_full[0] ),
										)
									) . '</div>';
								} else {
									echo '<div class="thumbnail" data-id="' . esc_attr( $thumb_id ) . '">' . wp_get_attachment_image( $thumb_id, $image_size ) . '</div>';
								}
							}
						} else {
							echo '<div class="thumbnail">' . esc_attr( wc_placeholder_img( $image_size ) ) . '</div>';
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
			$permalink = $product->get_permalink();
			do_action( 'sgsb_quick_view_details_button', $permalink, $content_view_details_button );
				echo '</div><!-- #sgsbqcv-popup -->';
			wp_reset_postdata();
		}

		wp_die();
	}
}
