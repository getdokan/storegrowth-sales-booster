import { Fragment } from 'react'
import { __ } from '@wordpress/i18n';

const Welcome = () => {
  return (
    <Fragment>
      <div className='sgsb-ini-setup-welcome'>
        <h3 className='sgsb-content-heading'>{__("Welcome To ", "storegrowth-sales-booster")} <span>{__("StoreGrowth", "storegrowth-sales-booster")}</span></h3>
        <span className='sgsb-sub-heading'>{__(`# 1 Marketing Plugin For WooCommerce
of StoreGrowth Turbocharge Your WooCommerce Store’s Sales!`, 'storegrowth-sales-booster')}</span>
        <button type="button" className='get-started-cta'>{__(`Get Starter`, 'storegrowth-sales-booster')}</button>
      </div>
    </Fragment>
  )
}

export default Welcome
