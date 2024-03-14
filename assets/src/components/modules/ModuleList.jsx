import React from 'react'
import { nanoid } from 'nanoid';
import { Row } from "antd";
import ModuleCard from './ModuleCard';

const ModuleList = ({ modules, filterActiveModules = false, minValue = 0, maxValue = 6, searchModule = "" }) => {
  return (
    <>
      <Row className="sgsb-admin-dashboard-module-box-content">
        {modules
          .filter((module) =>
            module.name.toLowerCase().includes(searchModule.toLowerCase())
          )
          .filter((module) => (filterActiveModules ? module.status : true)) // Filter based on the filterActiveModules state
          .slice(minValue, maxValue)
          .map((module) => (
            <ModuleCard module={module} key={nanoid()} />
          ))}
      </Row>
    </>
  );
};

export default ModuleList
