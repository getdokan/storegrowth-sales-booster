import { Select, Col, Row, InputNumber, Switch} from 'antd';
import InputColor from 'react-input-color';

const BasicDesign = (props) => {

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
				{/* <Col span={6}>
					Popup Position<br />
					<Select
						onChange = {(v) => props.onFieldChange('popup_position', v)}
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
				</Col> */}

				{/* <Col span={6}>
					Image Position<br />
					<Select
						onChange = {(v) => props.onFieldChange('image_position', v)}
						value    = {props.createPopupForm.image_position}
						style    = {{
							width  : '100%',
						}}
					>
						<Select.Option value="left">Left</Select.Option>
						<Select.Option value="right">Right</Select.Option>
					</Select>
				</Col> */}

				{/* <Col span={6}>
					Popup Width<br />
					<Select
						onChange = {(v) => props.onFieldChange('popup_width', v)}
						value    = {props.createPopupForm.popup_width}
						style    = {{
							width  : '100%',
						}}
					>
					{
						 [...Array(11).keys()].map((popupWidth, i)=><Select.Option value={popupWidth+20}>{popupWidth+20}</Select.Option>)
						
					}
					</Select>
				</Col> */}
			</Row>
			<br />
			<Row  gutter={30}>
				{/* <Col span={6}>
					Popup Image Width<br />
					<Select
						onChange = {(v) => props.onFieldChange('popup_image_width', v)}
						value    = {props.createPopupForm.popup_image_width}
						style    = {{
							width  : '100%',
						}}
				
					>
					{
						 [...Array(5).keys()].map((popupImageWidth, i)=><Select.Option value={popupImageWidth+21}>{popupImageWidth+21}</Select.Option>)

					}
					</Select>
				</Col> */}

				{/* <Col span={6}>
					Image width for mobile<br />
					<Select
						onChange = {(v) => props.onFieldChange('popup_mobile_image_width', v)}
						value    = {props.createPopupForm.popup_mobile_image_width}
						style    = {{
							width  : '100%',
						}}
					>
					{
						 [...Array(10).keys()].map((mobileImageWidth, i)=><Select.Option value={mobileImageWidth+21}>{mobileImageWidth+21}</Select.Option>)
						
					}
					</Select>
				</Col> */}

				{/* <Col span={6}>
					Border radius<br />
					<Select
						onChange = {(v) => props.onFieldChange('popup_border_radius', v)}
						value    = {props.createPopupForm.popup_border_radius}
						style    = {{
							width  : '100%',
						}}
					>
					{
						 [...Array(10).keys()].map((borderRadius, i)=><Select.Option value={borderRadius+5}>{borderRadius+5}</Select.Option>)
						
					}
					</Select>
				</Col> */}

				{/* <Col span={6}>
					Border radius of image<br />
					<InputNumber
						onChange    = {(v) => props.onFieldChange('popup_image_border_radius', v)}
						placeholder = "Enter border radius of popup"
						value       = {props.createPopupForm.popup_image_border_radius}
						style       = {{
							width  : '100%',
						}}
					/>
				</Col> */}
			</Row>
			<br />
			<Row  gutter={30}>
				<Col span={6}>
					Image Spacing<br />
					<Select
						onChange = {(v) => props.onFieldChange('spacing_around_image', v)}
						value    = {props.createPopupForm.spacing_around_image}
						style    = {{
							width  : '100%',
						}}
					>
					{
						 [...Array(11).keys()].map((imageSpacing, i)=><Select.Option value={imageSpacing+10}>{imageSpacing+10}</Select.Option>)
						
					}
					</Select>
				</Col>

				<Col span={6}>
					Link image to product page<br />
					<Switch 
						checked  = {(props.createPopupForm.link_image_to_product=='true' || props.createPopupForm.link_image_to_product== true)?true:false} 
						onChange = {(v) => props.onFieldChange('link_image_to_product', v)} 
					/>
				</Col>

				<Col span={6}>
					Open product link in new tab<br />
					<Switch 
						checked={(
                            props.createPopupForm.open_product_link_in_new_tab=='true'
						|| 
						    props.createPopupForm.open_product_link_in_new_tab== true
						)?true:false} 
						onChange={(v) => props.onFieldChange('open_product_link_in_new_tab', v)} 
					/>
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
