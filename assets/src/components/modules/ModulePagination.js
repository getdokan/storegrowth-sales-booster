import React from 'react';
import { Pagination } from 'antd';

function ModulePaginaton() {
    return (
        <Pagination defaultCurrent={1} total={50} />
    );
}

export default ModulePaginaton;