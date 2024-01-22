import React from "react";
import { Button } from "antd";
import { __ } from "@wordpress/i18n";
import { useSelect } from "@wordpress/data";

const CreateBogoButton = ({ navigate }) => {
  const { bogoListData } = useSelect((select) => ({
    bogoListData: select("sgsb_bogo").getBogoData(),
  }));
  const hash = window.location.hash.replace(/^#/, ""); // Remove the leading '#'

  const isCreateNew = [
    "bogo",
    "/bogo",
    "/bogo?tab_name=lists",
    "/bogo?tab_name=messages",
    "/bogo?tab_name=general",
    "bogo?tab_name=lists",
    "bogo?tab_name=messages",
    "bogo?tab_name=general",
  ].some((pattern) => pattern === hash);

  const isDisableBogoCreation = bogoListData?.length >= 2 && !sgsbAdmin.isPro;
  const isDisableMessageCreation = !sgsbAdmin.isPro;

  const buttonProps = {
    shape: "square",
    disabled: (hash === '/bogo?tab_name=messages' || hash?.includes('/bogo/create-message')) ? isDisableMessageCreation : isDisableBogoCreation,
    className: "create-bogo-button",
  };

  const getButtonLabel = () => {
    if (hash === '/bogo?tab_name=messages' || hash?.includes('/bogo/create-message')) {
      return __("Message List", "storegrowth-sales-booster");
    }
    return __("BOGO List", "storegrowth-sales-booster");
  };

  const getButtonClickHandler = () => {
    if (hash === '/bogo?tab_name=messages' || hash?.includes('/bogo/create-message')) {
      return () => navigate('bogo?tab_name=messages');
    }
    return () => navigate('bogo?tab_name=lists');
  };

  const renderButton = (label, onClick) => (
    <Button {...buttonProps} onClick={onClick}>
      {label}
    </Button>
  );

  return (
    <div className="bogo-action-buttons">
      {!isCreateNew &&
        renderButton(getButtonLabel(), getButtonClickHandler())
      }
      {isCreateNew &&
        renderButton(__("Create New", "storegrowth-sales-booster"), () =>
          navigate(
            (hash === '/bogo?tab_name=messages' || hash?.includes('/bogo/create-message')) ? 'bogo/create-message' : 'bogo/create-bogo'
          )
        )
      }
    </div>
  );
};

export default CreateBogoButton;
