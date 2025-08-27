import UpgradeCrown from "sales-booster/src/components/settings/Panels/PanelSettings/UpgradeCrown";

const LayoutOption = ( { src, name, disabled } ) => {
    return (
        <span className={ `layout-option` }>
            <span className={ `layout-img` }>
                <img src={ src } alt={ name } width={ `180` } />
            </span>
            <span className={ `option-name` }>
                { name } { disabled && <UpgradeCrown /> }
            </span>
        </span>
    );
}

export default LayoutOption;
