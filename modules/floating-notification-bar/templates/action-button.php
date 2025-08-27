<?php

$button_class = 'fn-bar-action-button';
if ( 'ba-close' === $button_action ) {
	$button_class .= ' sgsb-floating-notification-bar-remove';
}

if ( 'ba-url-redirect' === $button_action ) {
	// Display a button that redirects to the URL.
	echo '<a href="' . esc_url( $redirect_url ) . '" class="' . esc_attr( $button_class ) . '">';
	echo wp_kses_post( $button_text );
	echo '</a>';
} elseif ( 'ba-close' === $button_action ) {
	// Display a button with no functionality (close button).
	echo '<a type="button" class="' . esc_attr( $button_class ) . '">';
	echo wp_kses_post( $button_text );
	echo '</a>';
} else {
	// Display no button.
	echo '';
}
