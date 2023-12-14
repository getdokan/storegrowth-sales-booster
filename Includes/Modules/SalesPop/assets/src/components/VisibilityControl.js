import React from 'react';
import { Select } from 'antd';
import { __ } from '@wordpress/i18n';
import EmptyField from 'sales-booster/src/components/settings/Panels/PanelSettings/Fields/EmptyField';

const VisibilityControl = () => {
  const bannerPageShowOption = [
    { label: __('Show Everywhere','storegrowth-sales-booster'), value: 'banner-show-everywhere' },
  ];

  const userOption = [
    { value: 'both', label: __( 'Everyone',"storegrowth-sales-booster") },
  ];

  return (
    <div style={ { width: '100%' } }>
      <EmptyField
        needUpgrade={ true }
        title={ __( 'Visibility Control', 'storegrowth-sales-booster' ) }
        tooltip={ __(
          `Add page targeting to ensure the welcome bar only appears or doesn't appear for the selected pages only`,
          'storegrowth-sales-booster'
        ) }
        colSpan={ 24 }
        rightCol={ 15 }
        leftCol={ 9 }
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
          }}
        >
          {/* Banner Showing Options */}
          <Select
            value={ 'banner-show-everywhere' }
            style={{
              width: '100%',
            }}
            disabled={ true }
            options={ bannerPageShowOption }
          />
          {/* User types that will be available to see the pages */}
          <Select
            disabled={ true }
            options={ userOption }
            defaultValue={ 'both' }
            style={{
              width: '100%',
            }}
          />
        </div>
      </EmptyField>
    </div>
  );
};

export default VisibilityControl;
