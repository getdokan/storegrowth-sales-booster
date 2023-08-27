import { useState } from "@wordpress/element";
import { Switch } from "antd";
import React from "react";

function ModuleFilter({ onFilterChange }) {
  const [filterEnabled, setFilterEnabled] = useState(false);

  const handleSwitchChange = (checked) => {
    setFilterEnabled(checked);
    onFilterChange(checked);
  };

  return (
    <div className={"module-filter active"}>
      <li className="active-widgets" >
        Active Modules{" "}
        <Switch onChange={handleSwitchChange} checked={filterEnabled} />
      </li>
    </div>
  );
}

export default ModuleFilter;
