import { Fragment } from 'react'
import { useState, useEffect } from '@wordpress/element';
import { Checkbox } from 'antd';
import { __ } from '@wordpress/i18n';
import WelcomeAnnounce from '../../../images/welcome-announce.svg'
const Welcome = ({ next }) => {
  const [updateNews, setupdateNews] = useState(true);
  const [userDetails, setUserdetails] = useState(true);

  const getUserDetails = async () => {
    try {
      const response = await fetch('/wp-admin/admin-ajax.php', {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          _ajax_nonce: sgsbAdmin.nonce,
          action: 'sgsb_process_user_concent_data',
          updateNews,
          userDetails,
        }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const responseData = await response.json();
      console.log(responseData);
    } catch (error) {
      console.error('Error fetching user details:', error);
    }
  };
  return (
    <Fragment>
      <div className='sgsb-ini-setup-welcome'>
        <div className='ini-setup-announce-container'>
          <img className='annouce-image' src={WelcomeAnnounce} alt="storegrowth-icon" />
          <div className='annouce-contents'>
            <h3 className='sgsb-content-heading'>{__("Welcome To StoreGrowth", "storegrowth-sales-booster")}</h3>
            <span className='sgsb-sub-heading'>{__(`# 1 Marketing Plugin For WooCommerce
of StoreGrowth Turbocharge Your WooCommerce Store’s Sales!`, 'storegrowth-sales-booster')}</span>
          </div>
          <button onClick={() => { next(); getUserDetails(); }} type="button" className='steps-button get-started'>{__(`Get Started`, 'storegrowth-sales-booster')}</button>
        </div>
        <div className="ini-setup user-agreement">
          <div className="getting-updates">
            <Checkbox checked={updateNews} onChange={() => { setupdateNews(!updateNews) }} >
            <span className="user-agreement content-container">
              <p className="heading">{__('Get Updates: ', "storegrowth-sales-booster")}</p>
              <p className="content">{__('We will send essential tips & tricks for effective usage of StoreGrowth.', "storegrowth-sales-booster")}</p>
            </span>
            </Checkbox>
          </div>
          <div className="getting-essentials">
            <Checkbox checked={userDetails} onChange={() => { setUserdetails(!userDetails) }} >
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
