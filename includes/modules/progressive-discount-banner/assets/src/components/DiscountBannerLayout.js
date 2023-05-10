import { Card, Tabs, notification } from 'antd';
import { useEffect, useState, renderToString, createElement } from '@wordpress/element';
import { useDispatch } from '@wordpress/data';
import { IconPickerItem } from 'react-fa-icon-picker';

import SettingsTab from './SettingsTab';
import DesignTab from './DesignTab';

function DiscountBannerLayout() {
	const { setPageLoading } = useDispatch('spsb');
	const [buttonLoading, setButtonLoading] = useState(false);

	const [formData, setFormData] = useState({
		default_banner: false,
		default_banner_text: '',
		discount_banner: false,
		discount_type: 'free-shipping',
		discount_amount_mode: 'fixed-amount',
		discount_amount_value: '',
		cart_minimum_amount: '',
		progressive_banner_text: '',
		goal_completion_text: '',
		bar_position: 'top',
		background_color: '#2E5780',
		text_color: '#ffffff',
		icon_color: '#ffffff',
		default_banner_icon_name: '',
		default_banner_icon_html: '',
		progressive_banner_icon_name: '',
		progressive_banner_icon_html: '',
	});

	const getSettings = () => {
		setPageLoading(true);

		jQuery
			.ajax({
				url: spsbAdmin.ajax_url,
				method: 'POST',
				data: {
					action: 'spsb_pd_banner_get_settings',
					_ajax_nonce: spsbAdmin.nonce,
				},
			})
			.success((response) => {
				if (response.success && response.data) {
					setFormData({ ...formData, ...response.data });
					setTimeout(() => setPageLoading(false), 500);
				}
			});
	};

	useEffect(() => {
		getSettings();
	}, []);

	const onFieldChange = (key, value) => {
		setFormData({
			...formData,
			[key]: value,
		});
	};

	const notificationMessage = (type) => {

		if ( type == 'banner_settings') {
		  notification['success']({
			message     : 'Banner Settings Section',
			description : 'Banner settings section data updated successfully.',
		  });
		}
	
		if ( type == 'design') {
		  notification['success']({
			message     : 'Design Section',
			description : 'Design section data updated successfully.',
		  });
		}
	
	  }

	const onFormSave = (type) => {
		setButtonLoading(true);

		const data = {
			action: 'spsb_pd_banner_save_settings',
			_ajax_nonce: spsbAdmin.nonce,
			form_data: formData,
		};

		jQuery
			.ajax({
				url: spsbAdmin.ajax_url,
				method: 'POST',
				data,
			})
			.success(() => {
				setButtonLoading(false);
				notificationMessage(type);
			});
	};

  const onIconChange = (icon_name, html_name, value) => {
    let iconHtml = createElement(IconPickerItem, {icon: value});

    setFormData({
			...formData,
			[icon_name]: value,
			[html_name]: renderToString(iconHtml),
		});
  }

	return (
		<Card>
			<Tabs type="card">
				<Tabs.TabPane tab="Banner Settings" key="1">
					<SettingsTab
						formData={formData}
						onFieldChange={onFieldChange}
						onFormSave={()=>onFormSave('banner_settings')}
						buttonLoading={buttonLoading}
            			onIconChange={onIconChange}
					/>
				</Tabs.TabPane>

				<Tabs.TabPane tab="Design" key="2">
					<DesignTab
						formData={formData}
						onFieldChange={onFieldChange}
						onFormSave={()=>onFormSave('design')}
						buttonLoading={buttonLoading}
					/>
				</Tabs.TabPane>
			</Tabs>
		</Card>
	);
}

export default DiscountBannerLayout;
