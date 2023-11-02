import React from "react";
import { Button, Modal } from "antd";
import { ExclamationCircleOutlined } from "@ant-design/icons";
const ActivationAlert = ({
  isDashboard,
  activeModule,
  activeModalData,
  modalButtonLoad,
  handleModalAlert,
  handleModuleActivation,
}) => {
  return (
    <div>
      <Modal
        style={{
          left: "8%",
          maxWidth: 500,
        }}
        centered={true}
        open={activeModule}
        closeIcon={false}
        footer={null}
        width={null}
      >
        <div className="modal-content-wrapper">
          <div className="modal-content-heading-icon">
            <ExclamationCircleOutlined
              style={{
                fontSize: 43,
                color: "#FFBCC8",
              }}
            />
          </div>
          <h3 className="modal-content-heading">
            {`Do you want to active ${ isDashboard ? activeModalData?.label : activeModalData?.name }?`}
          </h3>
          <p className="modal-content">
            After activating the <strong>{ isDashboard ? activeModalData?.label : activeModalData?.name }</strong>{" "}
            module, you will be redirected to the module settings page where you
            can set up this module's features..
          </p>
          <div className="modal-controller-action-button">
            <Button
              className="modal-submit-button"
              loading={modalButtonLoad}
              key="submit"
              onClick={() => handleModuleActivation(activeModalData)}
            >
              Yes
            </Button>

            <Button
              className="modal-cancel-button"
              key="back"
              onClick={modalButtonLoad ? null : handleModalAlert}
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ActivationAlert;
