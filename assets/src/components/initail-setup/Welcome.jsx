import { Fragment } from 'react'
import { __ } from '@wordpress/i18n';

const Welcome = ( {next}) => {
  return (
    <Fragment>
      <div className='sgsb-ini-setup-welcome'>
        <h3 className='sgsb-content-heading'>{__("Welcome To ", "storegrowth-sales-booster")} <span>{__("StoreGrowth", "storegrowth-sales-booster")}</span></h3>
        <span className='sgsb-sub-heading'>{__(`# 1 Marketing Plugin For WooCommerce
of StoreGrowth Turbocharge Your WooCommerce Store’s Sales!`, 'storegrowth-sales-booster')}</span>
        <button onClick={next} type="button" className='steps-button get-started'>{__(`Get Started`, 'storegrowth-sales-booster')}</button>
      </div>
    </Fragment>
  )
}

export default Welcome
