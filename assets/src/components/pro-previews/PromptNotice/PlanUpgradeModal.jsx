import * as React from "react";

const CheckmarkItem = ({ children }) => (
  <div className="checkmark-item">
    <img src="https://cdn.builder.io/api/v1/image/assets/TEMP/c32d4a93d7dc396e078a979ce4698c18a32f4601c77829a174f5860272ddd96c?apiKey=473b364efdd5491386fc9b2f5377ea7f&" alt="Checkmark" className="checkmark-icon" />
    <div className="checkmark-text">{children}</div>
  </div>
);

const MoneyBackGuarantee = () => (
  <div className="money-back-guarantee">
    <img src="https://cdn.builder.io/api/v1/image/assets/TEMP/ee33545f11766c7d89cff84b065110973179ae29a304fd28ebb827dea96bb2ca?apiKey=473b364efdd5491386fc9b2f5377ea7f&" alt="Money Back Guarantee" className="money-back-icon" />
    <div className="money-back-text">100% Money Back Guarantee</div>
  </div>
);

const PlanUpgradeModal = () => {
  return (
    <>
      <div className="plan-upgrade-modal">
        <div className="plan-upgrade-content">
          <div className="plan-upgrade-left">
            <div className="plan-upgrade-details">
              <img src="https://cdn.builder.io/api/v1/image/assets/TEMP/d75a59c16090765d16c711a7020928f86ebf57041b24d66e5377ed6c1e169564?apiKey=473b364efdd5491386fc9b2f5377ea7f&" alt="Storegrowth Logo" className="storegrowth-logo" />
              <h2 className="plan-upgrade-title">Unlock the power of Storegrowth.</h2>
              <p className="plan-upgrade-description">
                Elevate your WooCommerce store with our sales booster plugin. Drive increased sales and enhance the shopping experience for your customers.
              </p>
              <div className="plan-upgrade-actions">
                <button className="cancel-button">Cancel</button>
                <button className="upgrade-button">Upgrade plan</button>
              </div>
            </div>
          </div>
          <div className="plan-upgrade-right">
            <div className="pro-plan-features">
              <h3 className="pro-plan-title">Include with the pro plan</h3>
              <CheckmarkItem>Unlimited support</CheckmarkItem>
              <CheckmarkItem>Access to premium templates</CheckmarkItem>
              <CheckmarkItem>Full access</CheckmarkItem>
              <CheckmarkItem>Multi site activation</CheckmarkItem>
            </div>
            <MoneyBackGuarantee />
          </div>
        </div>
      </div>

      <style jsx>{`
        .plan-upgrade-modal {
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 4%;
        }
        
        .plan-upgrade-content {
          display: flex;
          gap: 20px;
          border-radius: var(--S-12, 12px);
          background-color: #fff;
          max-width: 696px;
          overflow: hidden;
        }
        
        @media (max-width: 991px) {
          .plan-upgrade-content {
            flex-direction: column;
            gap: 0;
          }
        }
        
        .plan-upgrade-left {
          width: 59%;
        }
        
        @media (max-width: 991px) {
          .plan-upgrade-left {
            width: 100%;
          }
        }
        
        .plan-upgrade-details {
          display: flex;
          flex-direction: column;
          justify-content: center;
          flex-grow: 1;
          padding: 32px;
        }
        
        @media (max-width: 991px) {
          .plan-upgrade-details {
            padding: 0 20px;
          }
        }
        
        .storegrowth-logo {
          width: 48px;
          aspect-ratio: 1;
          object-fit: contain;
        }
        
        .plan-upgrade-title {
          color: var(--Text-color-Primary, #000012);
          margin-top: 16px;
          font: 700 30px/36px Inter, -apple-system, Roboto, Helvetica, sans-serif;
        }
        
        .plan-upgrade-description {
          color: var(--Text-color-Secondary, #373737);
          margin-top: 16px;
          font: 400 13px/20px Inter, -apple-system, Roboto, Helvetica, sans-serif;
        }
        
        .plan-upgrade-actions {
          display: flex;
          margin-top: 16px;
          gap: 16px;
          font-size: 14px;
          font-weight: 500;
          line-height: 140%;
        }
        
        .cancel-button {
          font-family: Inter, sans-serif;
          justify-content: center;
          border-radius: var(--S-6, 6px);
          background-color: var(--Default-Stroke, #e8e8e8);
          color: var(--Text-color-Primary, #000012);
          white-space: nowrap;
          flex: 1;
          padding: 8px 16px;
          border: none;
          cursor: pointer;
        }
        
        @media (max-width: 991px) {
          .cancel-button {
            white-space: initial;
            padding: 0 20px;
          }
        }
        
        .upgrade-button {
          font-family: Inter, sans-serif;
          justify-content: center;
          border-radius: var(--S-6, 6px);
          background-color: var(--Brand-Main, #1b49f6);
          color: var(--Default-White, #fff);
          flex: 1;
          padding: 8px 16px;
          border: none;
          cursor: pointer;
        }
        
        @media (max-width: 991px) {
          .upgrade-button {
            padding: 0 20px;
          }
        }
        
        .plan-upgrade-right {
          background-color: var(--Brand-Brand-light, #ddf0ff);
          width: 41%;
          margin-left: 20px;
        }
        
        @media (max-width: 991px) {
          .plan-upgrade-right {
            width: 100%;
            margin-left: 0;
          }
        }
        
        .pro-plan-features {
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          align-self: stretch;
          width: 100%;
          flex-grow: 1;
          font-size: 14px;
          color: var(--Text-color-Primary, #000012);
          font-weight: 500;
          line-height: 140%;
          margin: 0 auto;
          padding: 32px 24px;
        }
        
        @media (max-width: 991px) {
          .pro-plan-features {
            padding: 0 20px;
          }
        }
        
        .pro-plan-title {
          font: 600 19px Inter, sans-serif;
          margin: 0;
        }
        
        .checkmark-item {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 12px;
        }
        
        .checkmark-icon {
          width: 20px;
          height: 20px;
        }
        
        .checkmark-text {
          font-family: Inter, sans-serif;
        }
        
        .money-back-guarantee {
          border-radius: var(--S-12, 12px);
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 16px;
          color: var(--Black, #030013);
          font-weight: 600;
          line-height: 22px;
          padding: 12px;
          margin-top: 33px;
        }
        
        .money-back-icon {
          width: 48px;
          height: 48px;
        }
        
        .money-back-text {
          font-family: Inter, sans-serif;
          flex: 1;
        }
      `}</style>
    </>
  );
};

export default PlanUpgradeModal;
