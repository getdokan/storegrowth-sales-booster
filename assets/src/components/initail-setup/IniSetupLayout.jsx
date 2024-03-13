import {
  React,
  Fragment,
  useState,
  useRef,
  useEffect,
} from "@wordpress/element";
import Progress from "./Progress";
import { Steps } from "antd";
import StoreGrowthIcon from "../../../images/logo.svg";
import { __ } from "@wordpress/i18n";
import { Ajax } from "../../ajax";

const IniSetupLayout = () => {
  const [current, setCurrent] = useState(0);
  const contentLayoutRef = useRef(null);

  const agreementsData = {
    update_news: true,
    user_details: true,
  };
  const [agreementData, setAgreementData] = useState(agreementsData);

  const steps = [
    {
      title: "Welcome",
    },
    {
      title: "Modules",
    },
    {
      title: "Ready",
    },
  ];
  const stepSize = steps.length;

  const fetchData = async (url, params) => {
    try {
      const response = await fetch(url, {
        method: "POST",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams(params),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return await response.json();
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const getUserDetails = async () => {
    const params = {
      _ajax_nonce: sgsbAdmin.nonce,
      action: "sgsb_process_user_concent_data",
      data: JSON.stringify(agreementData),
    };
    return await fetchData("/wp-admin/admin-ajax.php", params);
  };

  const iniSetupChecker = async () => {
    const params = {
      _ajax_nonce: sgsbAdmin.nonce,
      action: "sgsb_inisetup_flag_update",
      sgsb_ini_completion: true,
    };
    return await fetchData("/wp-admin/admin-ajax.php", params);
  };

  const handleCheckbox = (key, value) => {
    setAgreementData({
      ...agreementData,
      [key]: value,
    });
  };

  const next = () => {
    setCurrent(current + 1);
  };

  const prev = () => {
    setCurrent(current - 1);
  };

  const redirectHandler = () => { window.location.href = 'admin.php?page=sgsb-settings#/dashboard/overview' };
  const skipHandler = (event) => {
    if (current !== (stepSize - 1)) {
      next();
    } else { redirectHandler(); iniSetupChecker(); }
  }

  useEffect(() => {
    // Scroll to the top of the content layout when 'current' changes
    if (current !== 0) {
      if (contentLayoutRef.current) {
        contentLayoutRef.current.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [current]);

  const DynamicContent = current !== (stepSize - 1) ? "Skip This Step" : "Skip  Guide";

  return (
    <Fragment>
      <div ref={contentLayoutRef} className="sgsb-ini-setup-page">
        <div className="sgsb-ini-page-container">
          <div className="storegrowth-icon">
            <img src={StoreGrowthIcon} alt="storegrowth-icon" />
            <Steps
              size="small"
              current={current}
              onChange={(value) => {
                setCurrent(value);
                if (value !== 0) {
                  getUserDetails();
                }
              }}
              items={steps}
            />
            <div className="steps-skipper-controller">
              <span
                className="skipper-link"
                onClick={() => skipHandler()}
              >
                {__(`${current !== 0 ? DynamicContent : ""}`, "storegrowth-sales-booster")}
              </span>
            </div>
          </div>
          <div className="sgsg-ini-setup-progress">
            {" "}
            <Progress
              next={next}
              prev={prev}
              current={current}
              setCurrent={setCurrent}
              stepSize={stepSize}
              agreementData={agreementData}
              handleCheckbox={handleCheckbox}
              getUserDetails={getUserDetails}
              iniSetupChecker={iniSetupChecker}
            />
          </div>
        </div>
      </div>
    </Fragment>
  );
};

export default IniSetupLayout;
