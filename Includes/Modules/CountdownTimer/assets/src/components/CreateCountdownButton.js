import React, { useEffect } from "react";
import { Button } from "antd";
import { __ } from "@wordpress/i18n";
import { useSelect, useDispatch } from "@wordpress/data";

const createCountdownButton = ({ navigate }) => {
  const { countdownListData } = useSelect((select) => ({
    countdownListData: [],
  }));
  // const { setBogoData } = useDispatch("sgsb_countdown_timer");

  // useEffect(() => {
  //   jQuery.post(
  //     bogo_save_url.ajax_url,
  //     {
  //       action: "bogo_list",
  //       data: [],
  //       _ajax_nonce: bogo_save_url.ajd_nonce,
  //     },
  //     function (bogoDataFromAjax) {
  //       const bogoDataParsed = bogoDataFromAjax.data;
  //       setBogoData(bogoDataParsed);
  //     }
  //   );
  // }, []);

  const hash = window.location.hash.replace(/^#/, ""); // Remove the leading '#'

  const isCreateNew = [
    "countdown",
    "/countdown-timer",
    "/countdown-timer?tab_name=countdown_list",
    "/countdown-timer?tab_name=messages",
    "/countdown-timer?tab_name=general",
    "countdown-timer?tab_name=countdown_list",
    "countdown-timer?tab_name=messages",
    "countdown-timer?tab_name=general",
  ].some((pattern) => pattern === hash);

  const isDisableBogoCreation = countdownListData?.length >= 2 && !sgsbAdmin.isPro;
  const isDisableMessageCreation = !sgsbAdmin.isPro;

  const commonButtonProps = {
    shape: "square",
    className: "create-bogo-button",
  };

  const buttonProps = {
    ...commonButtonProps,
    disabled: (hash === '/countdown-timer?tab_name=messages' || hash?.includes('/countdown-timer/create-message')) ? isDisableMessageCreation : isDisableBogoCreation,
  };

  const buttonPropsList = {
    ...commonButtonProps,
    disabled: false,
  };

  const getButtonLabel = () => {
    return (hash === '/countdown-timer?tab_name=messages' || hash?.includes('/countdown-timer/create-message')) ? __("Message List", "storegrowth-sales-booster") : __("Countdown List", "storegrowth-sales-booster");
  };

  const getButtonClickHandler = () => {
    return  () => navigate('countdown-timer?tab_name=countdown_list');
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
            (hash === '/countdown-timer?tab_name=messages' || hash?.includes('/countdown-timer/create-message')) ? 'countdown-timer/create-message' : 'countdown-timer/create-countdown'
          ),
          buttonProps
        )
      }
    </div>
  );
};

export default createCountdownButton;
