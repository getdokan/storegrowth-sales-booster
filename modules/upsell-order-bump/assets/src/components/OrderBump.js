import { Fragment } from "react";
import { __ } from "@wordpress/i18n";
import PanelHeader from "sales-booster/src/components/settings/Panels/PanelHeader";
import PanelContainer from "sales-booster/src/components/settings/Panels/PanelContainer";
import CreateBumpButton from "./CreateBumpButton";

function OrderBump({ outlet: Outlet, navigate, moduleId }) {
    return (
        <Fragment>
            <PanelHeader
                title={__("Order Bumps List", "storegrowth-sales-booster")}
                moduleId={moduleId}
            >
                <CreateBumpButton navigate={navigate} />
            </PanelHeader>
            <PanelContainer>
                <Outlet />
            </PanelContainer>
        </Fragment>
    );
}

export default OrderBump;
