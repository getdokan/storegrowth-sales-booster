import { Fragment } from 'react'
import { Checkbox } from 'antd';
import { __ } from '@wordpress/i18n';
import WelcomeAnnounce from '../../../images/welcome-announce.svg'
const Welcome = ({ next, agreementData, handleCheckbox, getUserDetails }) => {

  return (
    <Fragment>
      <div className='sgsb-ini-setup-welcome'>
        <div className='ini-setup-announce-container'>
          <img className='annouce-image' src={WelcomeAnnounce} alt="storegrowth-icon" />
          <div className='annouce-contents'>
            <h3 className='sgsb-content-heading'>{__("Welcome To StoreGrowth", "storegrowth-sales-booster")}</h3>
            <span className='sgsb-sub-heading'>{__(`Conversion Boosting Toolkit for WooCommerce`, 'storegrowth-sales-booster')}</span>
          </div>
          <button onClick={() => { next(); getUserDetails(); }} type="button" className='steps-button get-started'>{__(`Get Started`, 'storegrowth-sales-booster')}</button>
        </div>
        <div className="ini-setup user-agreement">
          <div className="getting-updates">
            <Checkbox checked={agreementData?.update_news} onChange={() => handleCheckbox('update_news', !agreementData?.update_news)} >
              <span className="user-agreement content-container">
                <p className="heading">{__('Get Updates: ', "storegrowth-sales-booster")}</p>
                <p className="content">{__('We will send essential tips & tricks for effective usage of StoreGrowth.', "storegrowth-sales-booster")}</p>
              </span>
            </Checkbox>
          </div>
          <div className="getting-essentials">
            <Checkbox checked={agreementData.user_details} onChange={() => handleCheckbox('user_details', !agreementData.user_details)} >
              <span className="user-agreement content-container">
                <p className="heading">{__('Share Essentials: ', "storegrowth-sales-booster")}</p>
                <p className="content">{__('Let us collect non-sensitive diagnosis data and usage information.', "storegrowth-sales-booster")}</p>
              </span>
            </Checkbox>
          </div>
        </div>
      </div>
    </Fragment>
  )
}

export default Welcome
