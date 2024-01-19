function footer() {
					if ( self::get_setting( 'view', 'popup' ) === 'sidebar' ) {
						echo '<div id="woosq-popup" class="woosq-sidebar woosq-position-' . esc_attr( self::get_setting( 'sidebar_position', '01' ) ) . ' woosq-heading-' . esc_attr( self::get_setting( 'sidebar_heading', 'no' ) ) . '"></div>';
						echo '<div class="woosq-overlay"></div>';
					}
				}
