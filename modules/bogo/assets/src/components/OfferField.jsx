import { Fragment } from "react";
import { useEffect } from '@wordpress/element';
import { __ } from "@wordpress/i18n";
import { Row, Col, Select, Card, InputNumber, Typography } from "antd";

import SettingsTooltip from "sales-booster/src/components/settings/Panels/PanelSettings/SettingsTooltip";
const { Title } = Typography;

const OfferField = ({ createBogoData, offerOptions, onFieldChange }) => {
  const isOfferFree = createBogoData.offer_type === "free";

  const handleOfferTypeChange = (value) => {
    onFieldChange("offer_type", value);
  };

  useEffect(() => {
    if (isOfferFree) {
      onFieldChange("discount_amount", 0);
    }
  }, [createBogoData?.offer_type]);

  return (
    <Fragment>
      <Col className="gutter-row" span={24}>
        <Card className={`sgsb-settings-card`}>
          <Row>
            <Col span={9}>
              <div className={`card-heading`}>
                <Title level={3} className={`settings-heading`}>
                  {__("Offer Price/Discount", "storegrowth-sales-booster")}
                </Title>
                <SettingsTooltip
                  content={`The discount offer can be specific price(${sgsbAdmin.currencySymbol}) or percentage(%).`}
                />
              </div>
            </Col>
            <Col span={15}>
              <Row gutter={10} style={{ margin: 0 }}>
                <Col span={6} style={{ paddingLeft: 0 }}>
                  <Select
                    style={{ width: "100%" }}
                    options={offerOptions}
                    value={createBogoData?.offer_type}
                    onChange={handleOfferTypeChange}
                    className={`settings-field single-select-field combine-select`}
                  />
                </Col>
                <Col span={18} style={{ paddingRight: 0 }}>
                  <InputNumber
                    value={createBogoData.discount_amount}
                    className={`settings-field number-field combine-field`}
                    onChange={(value) => onFieldChange("discount_amount", value)}
                    disabled={isOfferFree}
                  />
                </Col>
              </Row>
            </Col>
          </Row>
        </Card>
      </Col>
    </Fragment>
  );
};

export default OfferField;
