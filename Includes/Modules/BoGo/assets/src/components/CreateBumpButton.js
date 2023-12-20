import React from "react";
import { Button } from "antd";
import { __ } from "@wordpress/i18n";
import { useSelect } from "@wordpress/data";

const CreateBumpButton = ({ navigate }) => {
  const { bumpListData } = useSelect((select) => ({
    bumpListData: select("sgsb_bogo").getBogoData(),
  }));
  const hash = window.location.hash.replace(/^#/, ""); // Remove the leading '#'
  const createNewPatterns = [
    "bogo",
    "/bogo",
    "/bogo?tab_name=lists",
    "/bogo?tab_name=general",
    "bogo?tab_name=lists",
    "bogo?tab_name=general",
  ];

  const isCreateNew = createNewPatterns.some((pattern) => pattern === hash);

  const isDisableBumpCreation = bumpListData?.length >= 2 && !sgsbAdmin.isPro;
  const buttonProps = {
    shape: "square",
    disabled: isCreateNew ? isDisableBumpCreation : false,
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
        renderButton(__("BOGO List", "storegrowth-sales-booster"), () =>
          navigate("bogo")
        )}
      {isCreateNew &&
        renderButton(__("Create New", "storegrowth-sales-booster"), () =>
          navigate("bogo/create-bogo")
        )}
    </div>
  );
};

export default CreateBumpButton;
