import { Select, Col, Row } from 'antd';
import InputColor from 'react-input-color';

const fontStyle = {
	background:'#F2F8FF',
	height:'23px', 
	borderRadius:'5px'
}

const TextDesign = (props) => {

	return (
		<>
			<Row style={fontStyle}>
				<Col span={24}>
					<span style={{color:'#072965'}}>&nbsp;&nbsp; <b>{props.textTitle}</b> </span>
				</Col>
			</Row>

			<Row gutter={30} style={{marginTop:'10px'}}>
				<Col span={8}>
					Color<br />
					<InputColor
						initialValue = {props.fontColor}
						onChange     = {(v) => props.onFieldChange(props.fontName, v.hex)}
						placement    = "right"
						style        = {{
							width  : '100%',
							height : 30,
							float  : 'left',
						}}
					/>
				</Col>

				<Col span={8}>
					Font size<br />
					<Select
						onChange = {(v) => props.onFieldChange(props.fontSizeName, v)}
						value    = {props.fontSize}
						style    = {{
							width  : '100%',
						}}
					>
					{
						 [...Array(14).keys()].map((val, i)=><Select.Option value={val+12}>{val+12}</Select.Option>)
						
					}
					</Select>
				</Col>

				<Col span={8}>
					Font weight<br />
					<Select
						onChange = {(v) => props.onFieldChange(props.fontWeightName, v)}
						value    = {props.fontWeight}
						style    = {{
							width  : '100%',
						}}
					>
						<Select.Option value="normal">Normal</Select.Option>
						<Select.Option value="bold">Bold</Select.Option>
					</Select>
				</Col>				
			</Row>

			<br/><br/>
		</>
	)
}


export default TextDesign;
