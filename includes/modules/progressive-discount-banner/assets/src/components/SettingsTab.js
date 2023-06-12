import {
	Form,
	Select,
	Switch,
	Typography,
	Input,
	Button,
	InputNumber,
} from 'antd';
import { IconPicker } from 'react-fa-icon-picker';

function DiscountBannerFields(props) {
	const { formData, onFieldChange, onIconChange } = props;

	const FreeShippingExtra = <div>You need to set up free shipping on <a href="admin.php?page=wc-settings&tab=shipping">WooCommerce Shipping Settings</a> page.</div>;

	return (
		<>
			<Form.Item
				label="Discount Type"
				labelAlign="left"
        extra={formData.discount_type === 'free-shipping' ? FreeShippingExtra : null}
			>
				<Select
					value={formData.discount_type}
					style={{ width: 200 }}
					onChange={(v) => onFieldChange('discount_type', v)}
				>
					<Select.Option value="free-shipping">
						Free Shipping
					</Select.Option>
					<Select.Option value="discount-amount">
						Discount Amount
					</Select.Option>
				</Select>
			</Form.Item>

			{formData.discount_type === 'discount-amount' && (
				<Form.Item label="Discount Amount Mode" labelAlign="left">
					<Select
						value={formData.discount_amount_mode}
						style={{ width: 200 }}
						onChange={(v) =>
							onFieldChange('discount_amount_mode', v)
						}
					>
						<Select.Option value="fixed-amount">
							Fixed Amount
						</Select.Option>
						<Select.Option value="percentage">
							Percentage
						</Select.Option>
					</Select>
				</Form.Item>
			)}

			{formData.discount_type === 'discount-amount' && (
				<Form.Item
					label={
						formData.discount_amount_mode == 'percentage'
							? 'Discount Percentage'
							: 'Discount Amount'
					}
					labelAlign="left"
				>
					<InputNumber
						addonAfter={
							formData.discount_amount_mode == 'percentage'
								? '%'
								: null
						}
						addonBefore={
							formData.discount_amount_mode == 'fixed-amount'
								? sgsbAdmin.currencySymbol
								: null
						}
						min={0}
						value={formData.discount_amount_value}
						onChange={(v) =>
							onFieldChange('discount_amount_value', v)
						}
						style={{ width: 150 }}
					/>
				</Form.Item>
			)}

			<Form.Item
				label="Cart Minimum Amount"
				labelAlign="left"
				extra="Require minimum amount in customer cart to avail this discount."
			>
				<InputNumber
					min={0}
					addonBefore={sgsbAdmin.currencySymbol}
					value={formData.cart_minimum_amount}
					onChange={(v) => onFieldChange('cart_minimum_amount', v)}
					style={{ width: 150 }}
				/>
			</Form.Item>

			<Form.Item
				label="Progressive Banner Text"
				labelAlign="left"
				extra="This banner will be shown to customers when the cart amount is less than the required minimum amount. [amount] will be replaced with the real amount."
			>
				<Input
					value={formData.progressive_banner_text}
					onChange={(e) =>
						onFieldChange('progressive_banner_text', e.target.value)
					}
					placeholder="Add more [amount] to get free shipping."
				/>
			</Form.Item>

			<Form.Item
				label="Goal Completion Text"
				labelAlign="left"
				extra="This banner will be shown to customers when the cart amount exceeds the required minimum amount."
			>
				<Input
					value={formData.goal_completion_text}
					onChange={(e) =>
						onFieldChange('goal_completion_text', e.target.value)
					}
					placeholder="You have successfully acquired free shipping."
				/>
			</Form.Item>

      <Form.Item label="Progressive Banner Icon" labelAlign="left">
        <IconPicker
          onChange={(v) => onIconChange('progressive_banner_icon_name', 'progressive_banner_icon_html', v)}
          value={formData.progressive_banner_icon_name}
        />
      </Form.Item>
		</>
	);
}

function SettingsTab(props) {
	const { formData, onFieldChange, onFormSave, buttonLoading, onIconChange } = props;

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
			<Form.Item
				label="Default Banner"
				labelAlign="left"
				extra="The default banner will show when customer's cart is empty."
			>
				<Switch
					checkedChildren="Enable"
					unCheckedChildren="Disable"
					checked={formData.default_banner}
					onChange={(v) => onFieldChange('default_banner', v)}
				/>
			</Form.Item>

			{formData.default_banner && (
				<Form.Item label="Default Banner Text" labelAlign="left">
					<Input
						value={formData.default_banner_text}
						onChange={(e) =>
							onFieldChange('default_banner_text', e.target.value)
						}
						placeholder={`Shop more than ${sgsbAdmin.currencySymbol}100 to get free shipping.`}
					/>
				</Form.Item>
			)}

      {formData.default_banner && (
        <Form.Item label="Default Banner Icon" labelAlign="left">
          <IconPicker
            onChange={(v) => onIconChange('default_banner_icon_name', 'default_banner_icon_html', v)}
            value={formData.default_banner_icon_name}
          />
        </Form.Item>
			)}

			<Form.Item
				label="Discount Banner"
				labelAlign="left"
				extra="The discount banner will show when customer's have any items in the cart."
			>
				<Switch
					checkedChildren="Enable"
					unCheckedChildren="Disable"
					checked={formData.discount_banner}
					onChange={(v) => onFieldChange('discount_banner', v)}
				/>
			</Form.Item>

			{formData.discount_banner && (
				<DiscountBannerFields
					formData={formData}
					onFieldChange={onFieldChange}
          onIconChange={onIconChange}
				/>
			)}

			<Button type="primary" onClick={onFormSave} loading={buttonLoading}>
				Save Changes
			</Button>

      <p className="ant-form-item-explain" style={{margin: "15px 0 0 0"}}>Note: Please clear your cart in order to see the updates when you update these settings.</p>
		</Form>
	);
}

export default SettingsTab;
