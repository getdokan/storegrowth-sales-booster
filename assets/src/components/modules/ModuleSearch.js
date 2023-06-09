import React from 'react';
import { Input } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

function ModuleSearch() {

    return (
        <div className='search-bar'>
            <Input addonBefore={<SearchOutlined />} placeholder="Search" />
        </div>
    );
}

export default ModuleSearch;