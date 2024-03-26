import { Fragment } from "react";
import { __ } from '@wordpress/i18n';
import PanelHeader from "sales-booster/src/components/settings/Panels/PanelHeader";
import PanelContainer from "sales-booster/src/components/settings/Panels/PanelContainer";
import CreateBogoButton from "./CreateBogoButton";

function BogoLayout({ outlet: Outlet, navigate, useSearchParams }) {
    return (
        <Fragment>
            <PanelHeader title={ __( 'BOGO Settings', 'storegrowth-sales-booster' ) } moduleId={ 'bogo' }>
                <CreateBogoButton navigate={navigate} useSearchParams={useSearchParams} />
            </PanelHeader>
            <PanelContainer>
                <Outlet />
            </PanelContainer>
        </Fragment>
    );
}

export default BogoLayout;
