<?php
/**
 * The rewards bar in the block mini-cart. Bound to the Store API cart in
 * WooCommerce's Interactivity store, so it follows every cart change.
 *
 * @package SBFW
 */

defined( 'ABSPATH' ) || exit;
?>
<div class="spsg-cart-rewards spsg-cart-rewards--mini-cart" data-wp-interactive="woocommerce" data-wp-bind--hidden="!state.cart.extensions.storegrowth.rewards">
	<template data-wp-each--notice="state.cart.extensions.storegrowth.notices">
		<p class="spsg-cart-rewards__notice" data-wp-text="context.notice"></p>
	</template>
	<p class="spsg-cart-rewards__message" data-wp-text="state.cart.extensions.storegrowth.rewards.message"></p>
	<div class="spsg-cart-rewards__track">
		<div class="spsg-cart-rewards__fill" data-wp-style--width="state.cart.extensions.storegrowth.rewards.percent_width"></div>
	</div>
	<ul class="spsg-cart-rewards__chips">
		<template data-wp-each--milestone="state.cart.extensions.storegrowth.rewards.milestones">
			<li class="spsg-cart-rewards__chip" data-wp-class--is-reached="context.milestone.reached" data-wp-text="context.milestone.text"></li>
		</template>
	</ul>
	<template data-wp-each--unlocked="state.cart.extensions.storegrowth.rewards.unlocked">
		<p class="spsg-cart-rewards__unlocked" data-wp-text="context.unlocked.message"></p>
	</template>
</div>
