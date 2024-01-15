import { Card, Form, Select, Slider, Col,Row} from 'antd';
import { useDispatch, useSelect } from '@wordpress/data';
import InputColor from 'react-input-color';
import { useState } from 'react';



function OverViewArea(props) {
    const { setCreateFromData } = useDispatch( 'sgsb_order_bump' );
    const { createBumpData } = useSelect((select) => ({
        createBumpData: select('sgsb_order_bump').getCreateFromData()
    }));

    var offerAmout = 999999999;
    var offerMessage = "20% off only for you";

    if ( createBumpData.offer_type === 'discount' ) {
        offerAmout = createBumpData.offer_product_regular_price - createBumpData.offer_product_regular_price*createBumpData.offer_amount/100;
        offerMessage = createBumpData.offer_amount + "% off only for you";
    } else if ( createBumpData.offer_type === 'price' ) {
        offerAmout = createBumpData.offer_amount;
        offerMessage = "Just " + createBumpData.offer_amount + "$ only for you";
    }

    
    return (
    
    <Card className='template-overview-area'>
        <div className="offer-overview-top-text">
            OFFER OVERVIEW
        </div>
        <hr style={{marginBottom:createBumpData.box_top_margin+"px"}}/>
        <div className="offer-main-wrap" 
        style={createBumpData.box_border_style !== 'no_border'? {border:"2px "+ createBumpData.box_border_style+ " " + createBumpData.box_border_color} : {border:""}}>
            <div className="dynamic-offer-text" 
            style={{
                background : createBumpData.discount_background_color, 
                color      : createBumpData.discount_text_color,
                fontSize   : createBumpData.discount_font_size+'px',
            }}
            >
                {offerMessage}
            </div>
            <div className="product-image-and-title">
                <div className="offer-product-image">
                    <img src={createBumpData.offer_image_url} width='70' alt="" />
                    
                </div>
                <div className="offer-product-title" style={{
                    color    : createBumpData.product_description_text_color,
                    fontSize : createBumpData.product_description_font_size+'px'
                    }}>
                    <h3 style={{color:createBumpData.product_description_text_color}}>
                        {createBumpData.offer_product_title}
                    </h3>
                    <span style={{textDecoration:'line-through'}}>
                        ${createBumpData.offer_product_regular_price?createBumpData.offer_product_regular_price:999999999}.00
                    </span>&nbsp;&nbsp;
                    <span style={{textDecoration:'underline'}}>
                        ${offerAmout}.00
                    </span>
                    <br/>
                    <span>{createBumpData.product_description}</span>
                </div>
            </div>
            <div className="product-checkbox-and-excitement-message" style={{
                background : createBumpData.accept_offer_background_color,
                color      : createBumpData.accept_offer_text_color,
                fontSize   : createBumpData.accept_offer_font_size+'px',

            }}>
                <input type="checkbox" className='custom-checkbox' />{createBumpData.selection_title}
                
            </div>

            <div className="product-description" style={{
                background : createBumpData.offer_description_background_color,
                color      : createBumpData.offer_description_text_color,
                fontSize   : createBumpData.offer_description_font_size,

            }}>
                {createBumpData.offer_description} 
            </div>
        </div>
        <hr style={{marginTop:createBumpData.box_bottom_margin+'px'}} />
    </Card>
       
  );
};

export default OverViewArea;

