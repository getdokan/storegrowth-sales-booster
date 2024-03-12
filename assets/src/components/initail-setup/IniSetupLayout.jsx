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

const IniSetupLayout = () => {
  const [current, setCurrent] = useState(0);
  const contentLayoutRef = useRef(null);

  const agreementsData = {
    update_news: true,
    user_details: true,
  };
  const [agreementData, setAgreementData] = useState(agreementsData);

  const getUserDetails = async () => {
    try {
      const response = await fetch("/wp-admin/admin-ajax.php", {
        method: "POST",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          _ajax_nonce: sgsbAdmin.nonce,
          action: "sgsb_process_user_concent_data",
          data: JSON.stringify(agreementData),
        }),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const responseData = await response.json();
      console.log(responseData);
    } catch (error) {
      console.error("Error fetching user details:", error);
    }
  };

  const handleCheckbox = (key, value) => {
    setAgreementData({
      ...agreementData,
      [key]: value,
    });
  };

  // const clickHandler = () => { window.location.href = 'admin.php?page=sgsb-settings#/dashboard/overview' };

  const next = () => {
    setCurrent(current + 1);
  };

  const prev = () => {
    setCurrent(current - 1);
  };

  useEffect(() => {
    // Scroll to the top of the content layout when 'current' changes
    if (current !== 0) {
      if (contentLayoutRef.current) {
        contentLayoutRef.current.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [current]);

  const onChange = (value) => {
    setCurrent(value);
  };

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
                if (value === 1) {
                  getUserDetails();
                }
              }}
              items={steps}
            />
            <div className="steps-skipper-controller"></div>
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
            />
          </div>
        </div>
      </div>
    </Fragment>
  );
};

export default IniSetupLayout;
