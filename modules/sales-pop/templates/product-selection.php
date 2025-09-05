<?php
/**
 * This code is for popup product selection.
 *
 * @package Product selection.
 */

?>
<select id="product_list" name="product_list[]" multiple="multiple" style="width:50%">
	<?php
	foreach ( $products as $product ) :
		$selected = '';
		if ( is_array( $option ) && in_array( $product->ID, $option, true ) ) {
			$selected = 'selected';
		}
		?>
		<option value="<?php echo esc_attr( $product->ID ); ?>" <?php echo esc_attr( $selected ); ?>>
		<?php echo esc_attr( $product->post_title ); ?>
		</option>
	<?php endforeach; ?>     
</select>
