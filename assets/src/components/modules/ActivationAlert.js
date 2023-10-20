import React from "react";
import { Button, Modal } from "antd";
import { ExclamationCircleFilled } from "@ant-design/icons";
const ActivationAlert = ({
  activeModule,
  activeModalData,
  modalButtonLoad,
  handleModalAlert,
  handleModuleActivation
}) => {
  return (
    <div>
      <Modal
        centered={true}
        open={activeModule}
        onCancel={handleModalAlert}
        footer={[
          <Button
            loading={modalButtonLoad}
            key="submit"
            style={{
              color: "green",
              border: "1px solid green",
            }}
            onClick={() => handleModuleActivation(activeModalData)}
          >
            Yes
          </Button>,
          <Button key="back" danger onClick={handleModalAlert}>
            Cancel
          </Button>,
        ]}
      >
        <div className="modal-content-wrapper">
          <h3 className="modal-content-heading">
            <ExclamationCircleFilled
              style={{
                color: "orange",
              }}
            />{" "}
            {`Do you want to active ${activeModalData?.name}?`}
          </h3>
          <p className="modal-content">
            After activating the <strong>{activeModalData?.name}</strong>{" "}
            module, you will be redirected to the module settings page where you
            can set up this module's features..
          </p>
        </div>
      </Modal>
    </div>
  );
};

export default ActivationAlert;
