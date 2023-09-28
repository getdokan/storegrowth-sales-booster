import React from "react";
import { Image } from "antd";
import DocIcon from "../../../images/documentation-icon.svg";
import EmailIcon from "../../../images/email-icon.svg";
import RequestIcon from "../../../images/request-icon.svg";
const Overview = () => {
  return (
    <div className="dashboad-content">
      {/* intro-section */}
      <div className="intro-section">
        <div className="intro-section-banner">
          <div className="intro-section-text">
            <div className="music-player-background-is-the-background">
              <div className="music-player-background">
                <i
                  className="fa-solid fa-play music-player"
                  style={{ color: "#ffffff" }}
                ></i>
              </div>
            </div>
            <h1>
              Your First <br /> Impression With <br /> StoreGrowth
            </h1>
          </div>

          <div className="inrto-section-img-backgroud">
            <img src="src/assets/img/intro-section-img.svg" alt="intro-img" />
          </div>
        </div>
      </div>

      {/* info-section */}
      <div className="info-section">
        <div className="info-section-containt">
          {/* documentation-section */}
          <div className="documentation-section">
            <div className="documentation-section-containt">
              <div className="documentation-icon-background doc-icon">
                <Image
                  preview={false}
                  src={DocIcon}
                  className="documentation-icon"
                  alt="documentation-icon"
                />
              </div>

              <h1>Documentation</h1>
              <p>
                Lorem Ipsum is simply dummy text
                <br /> of the printing and typesetting Lorem
                <br /> Ipsum been the industry standard
                <br /> dummy the 1500s.
              </p>
              <a href="#">Read More</a>
            </div>
          </div>
          {/* close-documentation-section */}
          {/* email-section */}
          <div className="documentation-section">
            <div className="documentation-section-containt">
              <div className="documentation-icon-background email-icon">
                <Image
                  preview={false}
                  src={EmailIcon}
                  alt="email-icon.svg"
                  className="documentation-icon"
                />
              </div>

              <h1>Email Support</h1>
              <p>
                Lorem Ipsum is simply dummy text
                <br /> of the printing and typesetting Lorem
                <br /> Ipsum been the industry standard
                <br /> dummy the 1500s.
              </p>
              <a href="#">Contact Us</a>
            </div>
          </div>
          {/* close-email-section */}
        </div>
      </div>

      {/* open-request-features */}
      <div className="request-features">
        <div className="request-icon-background">
          <Image preview={false} src={RequestIcon} />
        </div>

        <h1>Have Any Thoughts or Feature Request?</h1>
        <p>
          Lorem ipsum dolor sit amet consectetur. Habitasse fames id suspendisse
          <br /> nec euismod pellentesque aliquam volutpat elementum cras id
          dictum suspendisse
          <br /> cras in ridiculus netus eget enim pellentesque. Scelerisque.
        </p>
        <span>
          <a href="#">Submit Request</a>
        </span>
      </div>
      {/* close-request-features */}
    </div>
  );
};

export default Overview;
