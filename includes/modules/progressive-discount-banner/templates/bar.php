<?php
/**
 * Template to show the bar.
 *
 * @package SBFW
 */

$settings    = sgsb_pd_banner_get_settings();
$banner_text = sgsb_pd_banner_get_banner_text( $settings );
$banner_icon = sgsb_pd_banner_get_banner_icon( $settings );
$custom_icon = sgsb_pd_banner_get_banner_custom_icon( $settings );
?>
<div class='sgsb-pd-banner-bar-wrapper'>
	<div class='sgsb-pd-banner-bar'>
		<div class='sgsb-pd-banner-bar-icon'></div>
		<span class='sgsb-pd-banner-text'>
			<?php
			/**
			 * Banner text filter.
			 *
			 * @since 1.0.0
			 */
			echo wp_kses_post( apply_filters( 'sales_boster_pd_banner_text', $banner_text ) );
			?>
		</span>
		<div class='sgsb-pd-banner-bar-remove'>
			<svg width='16' height='16' viewBox='0 0 16 16' fill='none' xmlns='http://www.w3.org/2000/svg'>
				<g clip-path='url(#clip0_205_1006)'>
					<path
						fill='white'
						d='M0.781396 16.0001C0.626858 16.0001 0.475783 15.9543 0.347281 15.8685C0.218778 15.7826 0.118621 15.6606 0.0594776 15.5178C0.000334661 15.3751 -0.0151369 15.218 0.0150198 15.0664C0.0451766 14.9148 0.119607 14.7756 0.228896 14.6664L14.6664 0.228853C14.8129 0.0823209 15.0117 0 15.2189 0C15.4261 0 15.6249 0.0823209 15.7714 0.228853C15.9179 0.375385 16.0002 0.574125 16.0002 0.781353C16.0002 0.988581 15.9179 1.18732 15.7714 1.33385L1.3339 15.7714C1.26141 15.844 1.17528 15.9016 1.08047 15.9408C0.985653 15.9801 0.884016 16.0002 0.781396 16.0001Z'
					/>
					<path
						fill='white'
						d='M15.2189 16.0001C15.1162 16.0002 15.0146 15.9801 14.9198 15.9408C14.825 15.9016 14.7388 15.844 14.6664 15.7714L0.228853 1.33385C0.0823209 1.18732 0 0.988581 0 0.781353C0 0.574125 0.0823209 0.375385 0.228853 0.228853C0.375385 0.0823209 0.574125 0 0.781353 0C0.988581 0 1.18732 0.0823209 1.33385 0.228853L15.7714 14.6664C15.8806 14.7756 15.9551 14.9148 15.9852 15.0664C16.0154 15.218 15.9999 15.3751 15.9408 15.5178C15.8816 15.6606 15.7815 15.7826 15.653 15.8685C15.5245 15.9543 15.3734 16.0001 15.2189 16.0001Z'
					/>
				</g>
				<defs>
					<clipPath id='clip0_205_1006'>
						<rect width='16' height='16' fill='white'/>
					</clipPath>
				</defs>
			</svg>
		</div>
	</div>
</div>
