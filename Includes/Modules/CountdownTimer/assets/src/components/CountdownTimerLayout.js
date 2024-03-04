import { Fragment } from "react";
import { __ } from '@wordpress/i18n';
import PanelHeader from "sales-booster/src/components/settings/Panels/PanelHeader";
import PanelContainer from "sales-booster/src/components/settings/Panels/PanelContainer";
import CreateCountdownButton from "./CreateCountdownButton";

function CountdownTimerLayout({ outlet: Outlet, navigate, useSearchParams ,moduleId}) {
    return (
        <Fragment>
            <PanelHeader title={ __( 'BOGO Settings', 'storegrowth-sales-booster' ) } moduleId={ moduleId }>
                <CreateCountdownButton navigate={navigate} useSearchParams={useSearchParams} />
            </PanelHeader>
            <PanelContainer>
                <Outlet />
            </PanelContainer>
        </Fragment>
    );
}

export default CountdownTimerLayout;
