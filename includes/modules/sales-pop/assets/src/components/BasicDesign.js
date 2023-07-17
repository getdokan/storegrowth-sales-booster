import { Select, Col, Row, InputNumber, Switch} from 'antd';
import InputColor from 'react-input-color';

const noop = () => {}

const BasicDesign = (props) => {

    const isProEnabled = sgsbAdmin.isPro;
    const upgradeTeaser = !isProEnabled && <span className="sgsb-field-upgrade-pro-label">(Upgrade to premium)</span>;
  
	return (
		<>
			<Row  gutter={30}>
				<Col span={6}>
					Background Color
					<InputColor
						initialValue = {props.createPopupForm.background_color}
						onChange     = {(v) => props.onFieldChange('background_color', v.hex)}
						placement    = "right"
						style        = {{
							width  : '100%',
							height : 30,
							float  : 'left',
						}}
					/>
				</Col>
				<Col span={6}>
					Popup Position<br />
					<Select
                        disabled = {upgradeTeaser}
						onChange = {upgradeTeaser ? (v) => props.onFieldChange('popup_position', v): noop}
						value    = {props.createPopupForm.popup_position}
						style    = {{
							width  : '100%',
						}}
					>
						<Select.Option value="left_bottom">Left Bottom</Select.Option>
						<Select.Option value="right_bottom">Right Bottom</Select.Option>
						<Select.Option value="left_top">Left Top</Select.Option>
						<Select.Option value="right_top">Right Top</Select.Option>
					</Select>
                    {upgradeTeaser}
				</Col>

				<Col span={6}>
					Image Position<br />
					<Select
                        disabled = {upgradeTeaser}
						onChange = {upgradeTeaser ? (v) => props.onFieldChange('image_position', v): noop}
						value    = {props.createPopupForm.image_position}
						style    = {{
							width  : '100%',
						}}
					>
						<Select.Option value="left">Left</Select.Option>
						<Select.Option value="right">Right</Select.Option>
					</Select>
                    {upgradeTeaser}
				</Col>

				<Col span={6}>
					Popup Width<br />
					<Select
                        disabled = {upgradeTeaser}
						onChange = {upgradeTeaser ? (v) => props.onFieldChange('popup_width', v): noop}
						value    = {props.createPopupForm.popup_width}
						style    = {{
							width  : '100%',
						}}
					>
					{
						 [...Array(11).keys()].map((popupWidth, i)=><Select.Option value={popupWidth+20}>{popupWidth+20}</Select.Option>)
						
					}
					</Select>
                    {upgradeTeaser}
				</Col>
			</Row>
			<br />
			<Row  gutter={30}>
				<Col span={6}>
					Popup Image Width<br />
					<Select
                        disabled = {upgradeTeaser}
						onChange = {upgradeTeaser ? (v) => props.onFieldChange('popup_image_width', v): noop}
						value    = {props.createPopupForm.popup_image_width}
						style    = {{
							width  : '100%',
						}}
				
					>
					{
						 [...Array(5).keys()].map((popupImageWidth, i)=><Select.Option value={popupImageWidth+21}>{popupImageWidth+21}</Select.Option>)

					}
					</Select>
                    {upgradeTeaser}
				</Col>

				<Col span={6}>
					Border radius<br />
					<Select
                        disabled = {upgradeTeaser}
						onChange = {upgradeTeaser ? (v) => props.onFieldChange('popup_border_radius', v): noop}
						value    = {props.createPopupForm.popup_border_radius}
						style    = {{
							width  : '100%',
						}}
					>
					{
						 [...Array(10).keys()].map((borderRadius, i)=><Select.Option value={borderRadius+5}>{borderRadius+5}</Select.Option>)
						
					}
					</Select>
                    {upgradeTeaser}
				</Col>

				<Col span={6}>
					Border radius of image<br />
					<InputNumber
                        disabled = {upgradeTeaser}
						onChange    = {upgradeTeaser ? (v) => props.onFieldChange('popup_image_border_radius', v): noop}
						placeholder = "Enter border radius of popup"
						value       = {props.createPopupForm.popup_image_border_radius}
						style       = {{
							width  : '100%',
						}}
					/>
                    {upgradeTeaser}
				</Col>
                <Col span={6}>
					Image Spacing<br />
					<Select
                        disabled = {upgradeTeaser}
						onChange = {upgradeTeaser ? (v) => props.onFieldChange('spacing_around_image', v): noop}
						value    = {props.createPopupForm.spacing_around_image}
						style    = {{
							width  : '100%',
						}}
					>
					{
						 [...Array(11).keys()].map((imageSpacing, i)=><Select.Option value={imageSpacing+10}>{imageSpacing+10}</Select.Option>)
						
					}
					</Select>
                    {upgradeTeaser}
				</Col>

			</Row>
			<br />
			<Row gutter={30}>
				<Col span={6}>
					Link image to product page<br />
					<Switch 
                        disabled = {upgradeTeaser}
						onChange = {upgradeTeaser ? (v) => props.onFieldChange('link_image_to_product', v) : noop} 
						checked  = {(props.createPopupForm.link_image_to_product=='true' || props.createPopupForm.link_image_to_product== true)?true:false} 
					/>
                    {upgradeTeaser}
				</Col>

				<Col span={6}>
					Open product link in new tab<br />
					<Switch 
                        disabled = {upgradeTeaser}
                        onChange={upgradeTeaser ? (v) => props.onFieldChange('open_product_link_in_new_tab', v) : noop} 
						checked={(
                            props.createPopupForm.open_product_link_in_new_tab=='true'
						|| 
						    props.createPopupForm.open_product_link_in_new_tab== true
						)?true:false} 
					/>
                    {upgradeTeaser}
				</Col>

				<Col span={6}>
					Show close button<br />
					<Switch 
						checked  = {(props.createPopupForm.show_close_button=='true' || props.createPopupForm.show_close_button== true)?true:false} 
						onChange = {(v) => props.onFieldChange('show_close_button', v)} 
					/>
				</Col>
			</Row>
            <br/><br/>
		</>
	)
}


export default BasicDesign;
