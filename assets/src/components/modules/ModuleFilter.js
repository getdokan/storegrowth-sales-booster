import React from 'react';
import { Menu, Dropdown, Checkbox, Select } from 'antd';

function ModuleFilter({onChange, options, value }) {

    // const menu = (
    //     <Menu>
    //       <Menu.Item>
    //         <Checkbox>All</Checkbox>
    //       </Menu.Item>
    //       <Menu.Item>
    //         <Checkbox>WooCommerce</Checkbox>
    //       </Menu.Item>
    //       <Menu.Item>
    //         <Checkbox>Sells</Checkbox>
    //       </Menu.Item>
    //       <Menu.Item>
    //         <Checkbox>Order Bump</Checkbox>
    //       </Menu.Item>
    //       <Menu.Item>
    //         <Checkbox>Cart</Checkbox>
    //       </Menu.Item>
    //     </Menu>
    // );

    return (
        <div className='module-filter'>
            {/* <Dropdown.Button overlay={menu}>Select</Dropdown.Button> */}
            <Select options={options} onChange={onChange} value={value} placeholder="Select module..."/>
        </div>
    );
}

export default ModuleFilter;