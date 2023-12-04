import { Col, Radio, Row } from 'antd';

const RadioTemplate = ( {
    name,
    classes,
    options,
    fieldValue,
    changeHandler,
} ) => {
    return (
        // Make settings radio template component without card preview.
        <Col className="gutter-row" span={ 24 }>
            <Radio.Group
                buttonStyle='solid'
                value={ fieldValue }
                className={ `settings-field radio-template-field ${ classes }` }
            >
                {/* Handle settings radio field by using dynamic props */}
                <Row justify="center" align={ `middle` } gutter={ [ 0, 16 ] }>
                    { options && options?.length > 0 && options?.map( (option,index) => (
                        <Col key={index} span={ 24 }>
                            <Radio.Button
                                value={ option?.key }
                                disabled={ option?.disabled }
                                onClick={ () => changeHandler( name, option?.key ) }
                            >
                                { option.component }
                            </Radio.Button>
                        </Col>
                    ) ) }
                </Row>
            </Radio.Group>
        </Col>
    );
}

export default RadioTemplate;
