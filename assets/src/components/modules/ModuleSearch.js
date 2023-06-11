import React from 'react';
import { Input} from 'antd';
import { SearchOutlined } from '@ant-design/icons';

function ModuleSearch({onChange}) {
    return (
        <div className='search-bar'>
            <Input addonBefore={<SearchOutlined />} onChange={onChange} placeholder="Search" />
        </div>
    );
}

export default ModuleSearch;