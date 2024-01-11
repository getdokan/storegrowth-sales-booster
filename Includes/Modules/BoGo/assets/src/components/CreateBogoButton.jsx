import React from "react";
import { Button } from "antd";
import { __ } from "@wordpress/i18n";
import { useSelect } from "@wordpress/data";

const CreateBogoButton = ({ navigate, useSearchParams }) => {
  const { bogoListData } = useSelect((select) => ({
    bogoListData: select("sgsb_bogo").getBogoData(),
  }));
  const hash = window.location.hash.replace(/^#/, ""); // Remove the leading '#'
  const createNewPatterns = [
    "bogo",
    "/bogo",
    "/bogo?tab_name=lists",
    "/bogo?tab_name=messages",
    "/bogo?tab_name=general",
    "bogo?tab_name=lists",
    "bogo?tab_name=messages",
    "bogo?tab_name=general",
  ];

  const isCreateNew = createNewPatterns.some((pattern) => pattern === hash);

  const isDisableBogoCreation = bogoListData?.length >= 2 && !sgsbAdmin.isPro;
  const buttonProps = {
    shape: "square",
    disabled: isCreateNew ? isDisableBogoCreation : false,
    className: "create-bogo-button",
  };

  const renderButton = (label, onClick) => (
    <Button {...buttonProps} onClick={onClick}>
      {label}
    </Button>
  );

  return (
    <div className="bogo-action-buttons">
      {!isCreateNew &&
        renderButton(
          (hash === '/bogo?tab_name=messages' || hash?.includes( '/bogo/create-message' ) ) ?
          __("Message List", "storegrowth-sales-booster" ) :
          __("BOGO List", "storegrowth-sales-booster" ),
          () => navigate(
            (hash === '/bogo?tab_name=messages' || hash?.includes( '/bogo/create-message' ) ) ? 'bogo?tab_name=messages' : 'bogo?tab_name=lists'
          )
        )
      }
      {isCreateNew &&
        renderButton(__("Create New", "storegrowth-sales-booster"), () =>
          navigate(
            (hash === '/bogo?tab_name=messages' || hash?.includes( '/bogo/create-message' ) ) ? 'bogo/create-message' : 'bogo/create-bogo'
          )
        )
      }
    </div>
  );
};

export default CreateBogoButton;
