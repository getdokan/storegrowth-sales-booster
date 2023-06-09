import React from 'react';
import { Menu, Dropdown, Checkbox } from 'antd';

function ModuleFilter() {

    const menu = (
        <Menu>
          <Menu.Item>
            <Checkbox>All</Checkbox>
          </Menu.Item>
          <Menu.Item>
            <Checkbox>WooCommerce</Checkbox>
          </Menu.Item>
          <Menu.Item>
            <Checkbox>Sells</Checkbox>
          </Menu.Item>
          <Menu.Item>
            <Checkbox>Order Bump</Checkbox>
          </Menu.Item>
          <Menu.Item>
            <Checkbox>Cart</Checkbox>
          </Menu.Item>
        </Menu>
    );

    return (
        <div className='module-filter'>
            <Dropdown.Button overlay={menu}>Select</Dropdown.Button>
        </div>
    );
}

export default ModuleFilter;