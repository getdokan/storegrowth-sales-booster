import React, { useEffect } from "react";
import { Button } from "antd";
import { __ } from "@wordpress/i18n";
import { useSelect, useDispatch } from "@wordpress/data";

const CreateBogoButton = ({ navigate }) => {
  const { bogoListData } = useSelect((select) => ({
    bogoListData: select("sgsb_bogo").getBogoData(),
  }));
  const { setBogoData } = useDispatch("sgsb_bogo");

  useEffect(() => {
    jQuery.post(
      bogo_save_url.ajax_url,
      {
        action: "bogo_list",
        data: [],
        _ajax_nonce: bogo_save_url.ajd_nonce,
      },
      function (bogoDataFromAjax) {
        const bogoDataParsed = bogoDataFromAjax.data;
        setBogoData(bogoDataParsed);
      }
    );
  }, []);

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

  const commonButtonProps = {
    shape: "square",
    className: "create-bogo-button",
  };

  const buttonProps = {
    ...commonButtonProps,
    disabled: (hash === '/bogo?tab_name=messages' || hash?.includes('/bogo/create-message')) ? isDisableMessageCreation : isDisableBogoCreation,
  };

  const buttonPropsList = {
    ...commonButtonProps,
    disabled: false,
  };

  const getButtonLabel = () => {
    return (hash === '/bogo?tab_name=messages' || hash?.includes('/bogo/create-message')) ? __("Message List", "storegrowth-sales-booster") : __("BOGO List", "storegrowth-sales-booster");
  };

  const getButtonClickHandler = () => {
    return (hash === '/bogo?tab_name=messages' || hash?.includes('/bogo/create-message')) ? () => navigate('bogo?tab_name=messages') : () => navigate('bogo?tab_name=lists');
  };

  const renderButton = (label, onClick, extraProps = {}) => (
    <Button {...extraProps} onClick={onClick}>
      {label}
    </Button>
  );

  return (
    <div className="bogo-action-buttons">
      {!isCreateNew &&
        renderButton(getButtonLabel(), getButtonClickHandler(), buttonPropsList)
      }
      {isCreateNew &&
        renderButton(__("Create New", "storegrowth-sales-booster"), () =>
          navigate(
            (hash === '/bogo?tab_name=messages' || hash?.includes('/bogo/create-message')) ? 'bogo/create-message' : 'bogo/create-bogo'
          ),
          buttonProps
        )
      }
    </div>
  );
};

export default CreateBogoButton;
