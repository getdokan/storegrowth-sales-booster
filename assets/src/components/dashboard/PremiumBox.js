import { Button, Image, Rate } from 'antd';
import React from 'react';
import capIcon from '../../../images/cap-icon.svg';
import premiumBoxIcon from '../../../images/premium-box-icon.svg';

function PremiumBox() {
  return (
    <div className='request__feature-block'>
        <Image
            className='box-icon'
            preview={false}
            width={70}
            src={premiumBoxIcon}
        />
        <h4>Get StoreGrowth <br/>Premium</h4>
        <p>Be the first to get new
        features & tools, before
        everyone else. Get 24/7
        support and boost your
        website’s visibility.
        </p>
        <Button className='premium-btn' type="primary" href='https://storegrowth.io/pricing/' size='large'>
            Get Premium 
            <Image
                preview={false}
                width={19}
                src={capIcon}
            />
        </Button>
    </div>
  )
}

export default PremiumBox
