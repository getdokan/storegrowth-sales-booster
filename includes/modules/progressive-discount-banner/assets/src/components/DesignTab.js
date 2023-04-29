import {
	Form,
	Select,
	Switch,
	Typography,
	Input,
	Button,
	InputNumber,
	notification
} from 'antd';
import InputColor from 'react-input-color';

function DesignTab(props) {
	const { formData, onFieldChange, onFormSave, buttonLoading } = props;

	return (
		<Form
			labelCol={{
				span: 7,
			}}
			wrapperCol={{
				span: 18,
			}}
			autoComplete="off"
		>
			<Form.Item label="Bar Position" labelAlign="left">
				<Select
					value={formData.bar_position}
					style={{ width: 200 }}
					onChange={(v) => onFieldChange('bar_position', v)}
				>
					<Select.Option value="top">Top</Select.Option>
					<Select.Option value="bottom">Bottom</Select.Option>
				</Select>
			</Form.Item>

      <Form.Item
        label="Background Color"
        labelAlign="left"
      >
        <InputColor
          initialValue={formData.background_color}
          onChange={(e) => onFieldChange('background_color', e.hex)}
          placement="right"
        />
      </Form.Item>

      <Form.Item
        label="Text Color"
        labelAlign="left"
      >
        <InputColor
          initialValue={formData.text_color}
          onChange={(e) => onFieldChange('text_color', e.hex)}
          placement="right"
        />
      </Form.Item>

      <Form.Item
        label="Icon Color"
        labelAlign="left"
      >
        <InputColor
          initialValue={formData.icon_color}
          onChange={(e) => onFieldChange('icon_color', e.hex)}
          placement="right"
        />
      </Form.Item>

			<Button type="primary" onClick={onFormSave} loading={buttonLoading}>
				Save Changes
			</Button>
		</Form>
	);
}

export default DesignTab;
