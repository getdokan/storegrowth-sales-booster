<?php
/**
 * The rewards bar on the cart page and in the fly cart.
 *
 * @package SBFW
 *
 * @var array $progress The bar's data (`Milestones::progress()`).
 */

defined( 'ABSPATH' ) || exit;
?>
<div class="spsg-cart-rewards" data-spsg-surface="cart_rewards">
	<p class="spsg-cart-rewards__message"><?php echo esc_html( $progress['message'] ); ?></p>
	<div class="spsg-cart-rewards__track">
		<div class="spsg-cart-rewards__fill" style="width: <?php echo esc_attr( (string) $progress['percent'] ); ?>%"></div>
	</div>
	<ul class="spsg-cart-rewards__chips">
		<?php foreach ( $progress['milestones'] as $milestone ) : ?>
			<li class="spsg-cart-rewards__chip<?php echo $milestone['reached'] ? ' is-reached' : ''; ?>">
				<?php echo esc_html( $milestone['text'] ); ?>
			</li>
		<?php endforeach; ?>
	</ul>
	<?php foreach ( $progress['unlocked'] as $unlocked ) : ?>
		<p class="spsg-cart-rewards__unlocked"><?php echo esc_html( $unlocked['message'] ); ?></p>
	<?php endforeach; ?>
</div>
