<?php
/**
 * Custom checkout template for our own.
 *
 * @package SBFW
 */

?>
<!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
	<meta charset="<?php bloginfo( 'charset' ); ?>">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<link rel="profile" href="http://gmpg.org/xfn/11">
	<link rel="pingback" href="<?php bloginfo( 'pingback_url' ); ?>">

	<?php wp_head(); ?>
	<style>
		html {
			margin-top: 0 !important;
		}
		body {
			padding-top: 10px;
		}
	</style>
</head>

<body <?php body_class( 'storepulse_sales_booster-checkout' ); ?>>

	<?php
		the_post();
		the_content();
	?>

	<?php wp_footer(); ?>
	<script>
		jQuery(window).load(function() {
			if ( window.parent.storepulse_sales_boosterFastCart ) {
				window.parent.storepulse_sales_boosterFastCart.updateIframeHeight( jQuery( 'html' ).height() );
			}
		});
	</script>
</body>
</html>
