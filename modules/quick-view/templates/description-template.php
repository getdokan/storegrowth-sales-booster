<?php 
global $post;
$heading = apply_filters( 'spsg_product_description_heading', __( 'Description', 'woocommerce' ) );
?>

<?php if ( $heading ) : ?>
	<h2><?php echo esc_html( $heading ); ?></h2>
<?php endif; ?>

<?php the_content(); ?>
