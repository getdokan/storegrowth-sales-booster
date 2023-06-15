import React from 'react';
import { Checkbox } from 'antd';
import { useState } from '@wordpress/element';

function ModuleFilter({ onFilter }) {
    const [selectedFilters, setSelectedFilters] = useState([]);
    const [isActive, setActive] = useState("false");

    const filters = [
      {
        name: 'All',
        value: 'All'
      },
      {
        name: 'Quick Cart',
        value: 'Quick Cart'
      },
      {
        name: 'Discount Banner',
        value: 'Discount Banner'
      },
      {
        name: 'Upsell',
        value: 'Upsell'
      },
      {
        name: 'Stock',
        value: 'Stock'
      },
      {
        name: 'Sales',
        value: 'Sales'
      },
      
    ]

    const handleFilterChange = (e) => {
      const filterValue = e.target.value;
      let newFilters = [];
  
      if (selectedFilters.includes(filterValue)) {
        newFilters = selectedFilters.filter((filter) => filter !== filterValue);
      } else {
        newFilters = [...selectedFilters, filterValue];
      }
  
      setSelectedFilters(newFilters);
      onFilter(newFilters);
    };

    const handleToggle = () => {
      setActive(!isActive);
    };

    return (
      <div className={isActive ? "module-filter" : 'module-filter active'}>
        <button role="button" onClick={handleToggle} class="select-dropdown__button">
          <span>Select </span>
        </button>
        <ul className='dropdown__list'>
            {
              filters.map((filter) => (
                <li>
                  <Checkbox
                    value={filter.value}
                    checked={selectedFilters.includes(filter.name)} 
                    onChange={handleFilterChange}
                  >
                    {filter.name}
                  </Checkbox>
                </li>
              ))
            }
        </ul>
      </div>
    );
}

export default ModuleFilter;