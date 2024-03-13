import { Fragment } from "react";
import { __ } from "@wordpress/i18n";
import CongratsAnnounce from '../../../images/congrats-announce.svg'

const Ready = () => {
  return (
    <Fragment>
      <div className='sgsb-ini-setup-welcome'>
        <div className='ini-setup-announce-container congratulation'>
          <img className='annouce-image' src={CongratsAnnounce} alt="storegrowth-icon" />
          <div className='annouce-contents'>
            <h3 className='sgsb-content-heading'>{__("Congratulation!", "storegrowth-sales-booster")}</h3>
            <span className='sgsb-sub-heading'>{__(`You are at the last step to complete the setup process and start using the exciting features of StoreGrowth`, 'storegrowth-sales-booster')}</span>
          </div>
          <div className="social-links">
            <a
              href="https://www.youtube.com/@Invizo-io"
              target="_blank"
              className="social-link youtube"
              onClick={null}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="21" height="20" viewBox="0 0 21 20" fill="none">
                <path d="M19.55 5.82143C19.325 5.07143 18.7625 4.53571 17.975 4.32143C16.625 4 10.8875 4 10.8875 4C10.8875 4 5.26251 4 3.80001 4.32143C3.01251 4.53571 2.45 5.07143 2.225 5.82143C2 7.21429 2 10 2 10C2 10 2 12.7857 2.3375 14.1786C2.5625 14.9286 3.125 15.4643 3.9125 15.6786C5.2625 16 11 16 11 16C11 16 16.625 16 18.0875 15.6786C18.875 15.4643 19.4375 14.9286 19.6625 14.1786C20 12.7857 20 10 20 10C20 10 20 7.21429 19.55 5.82143ZM9.19999 12.5714V7.42857L13.925 10L9.19999 12.5714Z" fill="#FF0000" />
              </svg>
              {__(`Youtube`, "storegrowth-sales-booster")}
            </a>
            <a
              href="https://support.invizo.io/"
              target="_blank"
              className="social-link get-support"
              onClick={null}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="21" height="20" viewBox="0 0 21 20" fill="none">
                <path d="M8.41699 17.5C9.56758 18.6111 11.4331 18.6111 12.5837 17.5" stroke="#008DFF" stroke-width="1.875" stroke-linecap="round" stroke-linejoin="round" />
                <path d="M2.16699 13.3334V10C2.16699 5.39765 5.89795 1.66669 10.5003 1.66669C15.1027 1.66669 18.8337 5.39765 18.8337 10L18.8337 13.3334" stroke="#008DFF" stroke-width="1.875" stroke-linecap="round" stroke-linejoin="round" />
                <path d="M14.667 11.5037C14.667 11.2157 14.667 11.0717 14.7103 10.9433C14.8363 10.5703 15.1685 10.4257 15.5012 10.2741C15.8753 10.1037 16.0623 10.0185 16.2477 10.0035C16.4581 9.98649 16.6688 10.0318 16.8487 10.1327C17.0871 10.2665 17.2533 10.5207 17.4236 10.7275C18.2097 11.6823 18.6027 12.1598 18.7466 12.6863C18.8627 13.1112 18.8627 13.5555 18.7466 13.9803C18.5368 14.7482 17.8741 15.392 17.3835 15.9878C17.1326 16.2926 17.0071 16.445 16.8487 16.5339C16.6688 16.6348 16.4581 16.6802 16.2477 16.6632C16.0623 16.6482 15.8753 16.563 15.5012 16.3926C15.1685 16.241 14.8363 16.0963 14.7103 15.7233C14.667 15.595 14.667 15.451 14.667 15.1629V11.5037Z" stroke="#008DFF" stroke-width="1.875" />
                <path d="M6.33366 11.5037C6.33366 11.1411 6.32347 10.8151 6.03025 10.5601C5.9236 10.4674 5.7822 10.403 5.49942 10.2741C5.12533 10.1038 4.93829 10.0186 4.75296 10.0036C4.19692 9.95864 3.89776 10.3381 3.5771 10.7276C2.79095 11.6824 2.39788 12.1598 2.25404 12.6863C2.13798 13.1111 2.13798 13.5555 2.25404 13.9803C2.46383 14.7482 3.12659 15.3918 3.61717 15.9876C3.9264 16.3632 4.2218 16.706 4.75296 16.663C4.93829 16.648 5.12533 16.5628 5.49942 16.3924C5.7822 16.2636 5.9236 16.1992 6.03025 16.1065C6.32347 15.8515 6.33366 15.5256 6.33366 15.1628V11.5037Z" stroke="#008DFF" stroke-width="1.875" />
              </svg>
              {__(`Get Support`, "storegrowth-sales-booster")}
            </a>
            <a
              href="https://storegrowth.io/docs/"
              target="_blank"
              className="social-link documentation"
              onClick={null}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="21" height="20" viewBox="0 0 21 20" fill="none">
                <g id="Frame">
                  <g id="Group 16">
                    <path id="Vector" d="M6.81738 10.8463H10.1507" stroke="#FF5C00" stroke-width="1.875" stroke-linecap="round" />
                    <path id="Vector_2" d="M6.81738 14.1797H13.4841" stroke="#FF5C00" stroke-width="1.875" stroke-linecap="round" />
                    <rect id="Rectangle 35" x="3.44" y="1.94" width="14.12" height="16.12" rx="3.06" stroke="#FF5C00" stroke-width="1.88" />
                  </g>
                </g>
              </svg>
              {__(`Documentation`, "storegrowth-sales-booster")}
            </a>
          </div>
        </div>
      </div>
    </Fragment>
  );
};

export default Ready;
