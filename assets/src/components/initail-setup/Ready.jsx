import { Fragment } from "react";
import { Switch } from 'antd';
import { __ } from "@wordpress/i18n";

const Ready = () => {

  const onChange = (checked) => {
    console.log(`switch to ${checked}`);
  };

  return (
    <Fragment>
      <div className="sgsb-step-completion">
        <div className="sgsb-inisetup-heading-content">
          <div className="completion-check-mark">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="20" viewBox="0 0 24 20" fill="none">
              <path d="M23.4502 0.578771C23.2915 0.395378 23.1026 0.249815 22.8945 0.150479C22.6864 0.0511427 22.4632 0 22.2378 0C22.0123 0 21.7891 0.0511427 21.581 0.150479C21.3729 0.249815 21.184 0.395378 21.0253 0.578771L8.30279 15.1753L2.95763 9.03146C2.7928 8.84903 2.59822 8.70558 2.385 8.6093C2.17179 8.51303 1.94411 8.46582 1.71497 8.47036C1.48582 8.4749 1.2597 8.53111 1.04952 8.63578C0.839339 8.74045 0.649207 8.89152 0.489982 9.08038C0.330757 9.26924 0.205558 9.49218 0.121531 9.73648C0.0375047 9.98077 -0.00370326 10.2416 0.000261141 10.5042C0.00422555 10.7667 0.0532845 11.0258 0.144636 11.2666C0.235988 11.5074 0.367844 11.7253 0.532675 11.9077L7.09031 19.4212C7.24906 19.6046 7.43794 19.7502 7.64604 19.8495C7.85414 19.9489 8.07735 20 8.30279 20C8.52822 20 8.75143 19.9489 8.95953 19.8495C9.16763 19.7502 9.35651 19.6046 9.51526 19.4212L23.4502 3.45503C23.6236 3.27181 23.7619 3.04943 23.8565 2.80192C23.9511 2.55441 24 2.28712 24 2.0169C24 1.74669 23.9511 1.4794 23.8565 1.23189C23.7619 0.984372 23.6236 0.761996 23.4502 0.578771Z" fill="#0875FF" />
            </svg>
          </div>
          <div className="setup-completion-heading">
            <h3 className="heading">
              {__("Congratulation", "storegrowth-sales-booster")}
            </h3>
            <span className="sub-heading">
              {__(
                "You are at the last step to complete the setup process and start using the exciting features of StoreGrawth",
                "storegrowth-sales-booster"
              )}
            </span>
          </div>
          <div className="completion-cta">
            <a
              href="/wp-admin/admin.php?page=sgsb-settings"
              className="steps-button completion-cta"
            >
              {__(`Ready To Go`, "storegrowth-sales-booster")}
            </a>
          </div>
        </div>
        <div className="sgsb-ini-setup-completion support-doc">
          <div className="sgsb-intro-video">
            <iframe
              width="560"
              height="315"
              src="https://www.youtube.com/embed/q9gWD7iUHX0?si=WYw0Z8QTGGHoCHdZ"
              title="YouTube video player"
              frameborder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowfullscreen
            ></iframe>
          </div>
          <div className="sgsb-support-doc-cta">
            <a href="https://storegrowth.io/docs/" target="_blank" className="steps-button doc-cta">
              {__("Documentaion", "storegrowth-sales-booster")}
            </a>

            <a href="https://support.invizo.io/" target="_blank" className="steps-button support-cta">
              {__("Get Support", "storegrowth-sales-booster")}
            </a>
          </div>
        </div>

        <div className="ini-setup user-agreement">
          <div className="getting-updates">
            <Switch defaultChecked onChange={onChange} />
            <div className="user-agreement content-container">
              <h3 className="heading">{__('Get Updates', "storegrowth-sales-booster")}</h3>
              <p className="content">{__('We will send essential tips & tricks for effective usage of StoreGrowth.', "storegrowth-sales-booster")}</p>
            </div>
          </div>
          <div className="getting-essentials">
            <Switch defaultChecked onChange={onChange} />
            <div className="user-agreement content-container">
              <h3 className="heading">{__('Share Essentials', "storegrowth-sales-booster")}</h3>
              <p className="content">{__('Let us collect non-sensitive diagnosis data and usage information.', "storegrowth-sales-booster")}</p>
            </div>
          </div>
        </div>
      </div>
    </Fragment>
  );
};

export default Ready;
