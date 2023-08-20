import { useState } from '@wordpress/element';
import React from 'react';

function ModuleFilter({ onFilterChange, categories }) {
    const [isActive, setActive] = useState("false");

    const handleToggle = () => {
      setActive(!isActive);
    };

    return (
      <div className={isActive ? "module-filter" : 'module-filter active'}>
        <button role="button" onClick={handleToggle} class="select-dropdown__button">
          <span>Select </span>
        </button>
        <ul className='dropdown__list'>
          {categories.map(category => (
            <li key={category}>
              <label>
                <input 
                  onChange={onFilterChange}
                  type="checkbox"
                  value={category} />
                {category}
              </label>
            </li>
          ))}

        </ul>
      </div>
    );
}

export default ModuleFilter;