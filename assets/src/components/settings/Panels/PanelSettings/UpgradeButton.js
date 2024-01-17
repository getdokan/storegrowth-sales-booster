import { __ } from '@wordpress/i18n';
import UpgradeCrown from "./UpgradeCrown";

const UpgradeButton = () => {
    return (
        <a
            href='https://storegrowth.io/pricing/'
            className={ `upgrade-button` }
            target="_blank"
        >
            { __('Upgrade to PRO ', 'storegrowth-sales-booster' ) }
            <UpgradeCrown proBadge={ false } classes={ `overlay-btn-crown` } />
        </a>
    );
}

export default UpgradeButton;
