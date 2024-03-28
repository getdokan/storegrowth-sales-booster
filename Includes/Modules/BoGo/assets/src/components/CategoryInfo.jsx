import { __ } from "@wordpress/i18n";
import { Fragment } from "react";
import TextInput from "sales-booster/src/components/settings/Panels/PanelSettings/Fields/TextInput";
import SettingsSection from "sales-booster/src/components/settings/Panels/PanelSettings/SettingsSection";
import SelectBox from "sales-booster/src/components/settings/Panels/PanelSettings/Fields/SelectBox";

const CategoryInfo = ({ categoryId, categoryList, categoryMessage, setCategoryId, setCategoryMessage }) => {
  const onFieldChange = (key, value) => {
    if ( key === 'message' ) {
      setCategoryMessage( value );
    } else {
      setCategoryId( value );
    }
  };

  return (
    <Fragment>
      <SettingsSection>
        <SelectBox
          name={ 'id' }
          colSpan={ 24 }
          showSearch={ true }
          fieldWidth={ '100%' }
          options={ categoryList }
          changeHandler={ onFieldChange }
          classes={ `search-single-select` }
          fieldValue={ categoryId ? categoryId : '' }
          title={ __( 'Select Target Category', 'storegrowth-sales-booster' ) }
          placeHolderText={ __( 'Search for category', 'storegrowth-sales-booster' ) }
          tooltip={ __(
            'The target category will be displayed BOGO offer message.',
            'storegrowth-sales-booster'
          ) }
          filterOption={ ( inputValue, option ) =>
            option?.children?.[0]
              ?.toString()
              ?.toLowerCase()
              ?.includes( inputValue.toLowerCase() )
          }
        />
        <TextInput
          name={ `message` }
          fullWidth={ true }
          fieldValue={ categoryMessage }
          changeHandler={ onFieldChange }
          title={ __( 'Category Page Message', 'storegrowth-sales-booster' ) }
          placeHolderText={__(
            'Enter category message',
            'storegrowth-sales-booster'
          ) }
        />
      </SettingsSection>
    </Fragment>
  );
};

export default CategoryInfo;
