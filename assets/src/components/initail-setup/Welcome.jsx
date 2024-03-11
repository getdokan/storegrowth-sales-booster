import { Fragment } from 'react'
import { useState, useEffect } from '@wordpress/element';
import { Switch } from 'antd';
import { __ } from '@wordpress/i18n';

const Welcome = ( {next}) => {
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
        <h3 className='sgsb-content-heading'>{__("Welcome To ", "storegrowth-sales-booster")} <span>{__("StoreGrowth", "storegrowth-sales-booster")}</span></h3>
        <span className='sgsb-sub-heading'>{__(`# 1 Marketing Plugin For WooCommerce
of StoreGrowth Turbocharge Your WooCommerce Store’s Sales!`, 'storegrowth-sales-booster')}</span>
        <div className="ini-setup user-agreement">
          <div className="getting-updates">
            <Switch defaultChecked onChange={(checked) => { setupdateNews(checked) }} />
            <div className="user-agreement content-container">
              <h3 className="heading">{__('Get Updates', "storegrowth-sales-booster")}</h3>
              <p className="content">{__('We will send essential tips & tricks for effective usage of StoreGrowth.', "storegrowth-sales-booster")}</p>
            </div>
          </div>
          <div className="getting-essentials">
            <Switch defaultChecked onChange={(checked) => { setUserdetails(checked) }} />
            <div className="user-agreement content-container">
              <h3 className="heading">{__('Share Essentials', "storegrowth-sales-booster")}</h3>
              <p className="content">{__('Let us collect non-sensitive diagnosis data and usage information.', "storegrowth-sales-booster")}</p>
            </div>
          </div>
        </div>
        <button onClick={() => { next(); getUserDetails(); }} type="button" className='steps-button get-started'>{__(`Get Started`, 'storegrowth-sales-booster')}</button>
      </div>
    </Fragment>
  )
}

export default Welcome
