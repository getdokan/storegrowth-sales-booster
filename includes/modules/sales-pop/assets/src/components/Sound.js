import { Form, Select, Switch } from 'antd';
import { useDispatch, useSelect } from '@wordpress/data';

function Sound() {
	const { setCreateFromData } = useDispatch( 'sgsb_order_sales_pop' );

	const { createPopupForm } = useSelect( ( select ) => ({
		createPopupForm: select('sgsb_order_sales_pop').getCreateFromData()
	}));

	const onFieldChange = (key, value) => {
		setCreateFromData( {
			...createPopupForm,
			[key] : value,
		  } );
	};

	return (
		<>
			<Form.Item
				label="Enable"
				labelAlign ='left'
			>
				<Switch 
					checked  = {(createPopupForm.sound=='true' || createPopupForm.sound== true)?true:false} 
					onChange = {(v) => onFieldChange('sound', v)} 
				/>
			</Form.Item>

			<Form.Item
				label      = "Sound"
				labelAlign = 'left'
				extra      = "Please select sound. Rings when notification show"
			>
			<Select
				onChange = {(v) => onFieldChange('sound_type', v)}
				value    = {createPopupForm.sound_type}
			
			>
				<Select.Option value="sound_a">Sound A</Select.Option>
				<Select.Option value="sound_b">Sound B</Select.Option>
			</Select>
		  </Form.Item>
		</>
	);
}

export default Sound;
