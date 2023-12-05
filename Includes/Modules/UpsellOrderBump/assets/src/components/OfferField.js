import React from "react";
import { __ } from "@wordpress/i18n";
import { Row, Col, Select, Card, InputNumber, Typography } from "antd";

import SettingsTooltip from "sales-booster/src/components/settings/Panels/PanelSettings/SettingsTooltip";
const { Title } = Typography;

const OfferField = ({ createBumpData, offerOptions, onFieldChange }) => {
  return (
    <>
      <Card className={`sgsb-settings-card`}>
        <Row>
          <Col span={9}>
            <div className={`card-heading`}>
              <Title level={3} className={`settings-heading`}>
                {__("Offer Price/Discount", "storegrowth-sales-booster")}
              </Title>
              <SettingsTooltip content={`The discount offer can be specific price(${sgsbAdmin.currencySymbol}) or percentage(%).`} />
            </div>
          </Col>
          <Col span={15}>
            <Row gutter={10} style={{ margin: 0 }}>
              <Col span={6} style={{ paddingLeft: 0 }}>
                <Select
                  style={{ width: "100%" }}
                  options={offerOptions}
                  value={createBumpData.offer_type}
                  onChange={(v) => onFieldChange("offer_type", v)}
                  className={`settings-field single-select-field combine-select`}
                />
              </Col>
              <Col span={18} style={{ paddingRight: 0 }}>
                <InputNumber
                  value={createBumpData.offer_amount}
                  className={`settings-field number-field combine-field`}
                  onChange={(value) => onFieldChange("offer_amount", value)}
                />
              </Col>
            </Row>
          </Col>
        </Row>
      </Card>
    </>
  );
};

export default OfferField;
