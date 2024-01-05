import { Checkbox, Col } from "antd";
import SettingsTooltip from "sales-booster/src/components/settings/Panels/PanelSettings/SettingsTooltip";
import UpgradeCrown from "sales-booster/src/components/settings/Panels/PanelSettings/UpgradeCrown";
import { Fragment } from "react";

const CartContent = ({
    name,
    title,
    tooltip,
    areaRows,
    checkedValue,
    changeHandler,
    needUpgrade = false,
}) => {
    return (
        // Make settings checkbox component with card preview.
        <Fragment>
            <Col span={2}>
                {/* Handle settings checkbox field by using dynamic props */}
                <Checkbox
                    id={name}
                    value={name}
                    rows={areaRows}
                    disabled={needUpgrade}
                    checked = {checkedValue}
                    className={`settings-field single-content-field`}
                    onChange={(event) => changeHandler(name, event.target.checked)}
                >
                </Checkbox>
            </Col>
            <Col span={22}>
                <div className={`card-heading checkbox-heading`}>
                    {/* Handle checkbox title. */}
                    <label htmlFor={name} className={`settings-heading content-field-heading`}>
                        {title}
                    </label>
                    {/* Handle checkbox tooltip. */}
                    {tooltip && <SettingsTooltip content={tooltip} />}
                    {/* Handle checkbox settings upgrade icon. */}
                    {needUpgrade && (
                        <span className={ `upgrade-content` } >
                            <UpgradeCrown />
                        </span>
                    ) }
                </div>
            </Col>
        </Fragment>
    );
}

export default CartContent;
