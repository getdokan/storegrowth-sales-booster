import React from "react";
import { CaretRightOutlined } from "@ant-design/icons";
import { Collapse, Image } from "antd";
import AccorUP from "../../../images/accor-up.svg";
import AccorDown from "../../../images/accor-donw.svg";
const text = `
  A dog is a type of domesticated animal.
  Known for its loyalty and faithfulness,
  it can be found as a welcome guest in many households across the world.
`;

const getItems = (panelStyle) => [
  {
    key: "1",
    label: "This is panel header 1",
    children: <p>{text}</p>,
    style: panelStyle,
  },
  {
    key: "2",
    label: "This is panel header 2",
    children: <p>{text}</p>,
    style: panelStyle,
  },
  {
    key: "3",
    label: "This is panel header 3",
    children: <p>{text}</p>,
    style: panelStyle,
  },
];
const Faq = () => {
  const panelStyle = {
    marginBottom: 24,
    background: "#ffffff",
    borderRadius: "5px",
    border: "1px solid #DDE6F9",
    padding: "26px",
    
  };

  return (
    <div className="dashboad-content">
      <div className="faqs_wrapper">
        <div className="faqs-heading">
          <h4>Frequently asked questions</h4>
        </div>
        <Collapse
          bordered={false}
          expandIconPosition="end"
          defaultActiveKey={["1"]}
          expandIcon={({ isActive }) => (
            <Image preview={false} src={isActive ? AccorUP : AccorDown} />
          )}
          style={{
            background: "none",
          }}
          items={getItems(panelStyle)}
        />
      </div>
    </div>
  );
};

export default Faq;
