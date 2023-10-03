import UpgradeButton from "./UpgradeButton";

const UpgradeOverlay = ( { classes } ) => {
    return (
        <div className={ `${classes} pro-content-overlay` }>
            <UpgradeButton />
        </div>
    );
}

export default UpgradeOverlay;
