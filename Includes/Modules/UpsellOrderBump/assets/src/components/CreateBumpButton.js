import React from "react";
import { Button } from "antd";
import { __ } from "@wordpress/i18n";
import { useSelect } from "@wordpress/data";

const CreateBumpButton = ({ navigate }) => {
    const { bumpListData } = useSelect((select) => ({
        bumpListData: select("sgsb_order_bump").getBumpData(),
    }));
    const hash = window.location.hash.replace(/^#/, ''); // Remove the leading '#'
    const isBumpListPage = hash === 'upsell-order-bump' || hash === '/upsell-order-bump';    
    const isDisableBumpCreation = bumpListData?.length >= 2 && !sgsbAdmin.isPro;
    const buttonProps = {
        shape: "round",
        disabled: isBumpListPage ? isDisableBumpCreation : false,
        className: "create-upsell-order-bump-button",
    };

    const renderButton = (label, onClick) => (
        <Button {...buttonProps} onClick={onClick}>
            {label}
        </Button>
    );

    return (
        <div className="upsell-order-bump-action-buttons">
            {!isBumpListPage && renderButton(__("Bump List", "storegrowth-sales-booster"), () => navigate("upsell-order-bump"))}
            {isBumpListPage && renderButton(__("Create New", "storegrowth-sales-booster"), () => navigate("upsell-order-bump/create-bump"))}
        </div>
    );
};

export default CreateBumpButton;
