import { SearchOutlined } from '@ant-design/icons';
import { useState } from '@wordpress/element';
import { Input } from 'antd';
import React from 'react';

function ModuleSearch({onChange}) {

    const [isActive, setIsActive] = useState(false);

    const handleSearchClass = () => setIsActive((prevIsActive) => !prevIsActive);

    return (
        <div className={isActive ? 'search-bar active' : 'search-bar'}>
            <Input addonAfter={<SearchOutlined onClick={handleSearchClass} />} onChange={onChange} placeholder="Search" />
        </div>
    );
}

export default ModuleSearch;
