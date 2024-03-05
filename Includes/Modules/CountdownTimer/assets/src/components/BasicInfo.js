import React, { Fragment } from "react";
import { __ } from "@wordpress/i18n";
import SettingsSection from "sales-booster/src/components/settings/Panels/PanelSettings/SettingsSection";
import TextInput from "sales-booster/src/components/settings/Panels/PanelSettings/Fields/TextInput";
import SelectBox from "sales-booster/src/components/settings/Panels/PanelSettings/Fields/SelectBox";

const BasicInfo = () => {
  const onFieldChange = () => {};

  return (
    <Fragment>
      <SettingsSection>
        <TextInput
          fullWidth={true}
          name={`name_of_order_bogo`}
          changeHandler={onFieldChange}
          // fieldValue={createBogoData.name_of_order_bogo}
          title={__("Name of Timer", "storegrowth-sales-booster-pro")}
          placeHolderText={__(
            "Enter Countdown Timer Name",
            "storegrowth-sales-booster-pro",
          )}
        />
        <TextInput
          fullWidth={true}
          name={`name_of_order_bogo`}
          changeHandler={onFieldChange}
          // fieldValue={createBogoData.name_of_order_bogo}
          title={__("Timer Heading Text", "storegrowth-sales-booster-pro")}
          placeHolderText={__(
            "Enter Countdown Timer Name",
            "storegrowth-sales-booster-pro",
          )}
        />

<SelectBox
          colSpan={24}
          showSearch={true}
          fieldWidth={"100%"}
          classes={`search-single-select`}
          name={"offered_products"}
          changeHandler={onFieldChange}
          // options={originalProductListForSelect}
          // fieldValue={createBogoData?.offered_products}
          title={__(
            "Timer For",
            "storegrowth-sales-booster-pro",
          )}
          placeHolderText={__(
            "Search for products",
            "storegrowth-sales-booster-pro",
          )}
          tooltip={__(
            "The target product indicates for which specific products the upsell order bogo option will be displayed.",
            "storegrowth-sales-booster-pro",
          )}
        />

        <SelectBox
          colSpan={24}
          showSearch={true}
          fieldWidth={"100%"}
          classes={`search-single-select`}
          name={"offered_products"}
          changeHandler={onFieldChange}
          // options={originalProductListForSelect}
          // fieldValue={createBogoData?.offered_products}
          title={__(
            "",
            "storegrowth-sales-booster-pro",
          )}
          placeHolderText={__(
            "Search for products",
            "storegrowth-sales-booster-pro",
          )}
          tooltip={__(
            "The target product indicates for which specific products the upsell order bogo option will be displayed.",
            "storegrowth-sales-booster-pro",
          )}
          // filterOption={(inputValue, option) =>
          //   option?.children?.[0]
          //     ?.toString()
          //     ?.toLowerCase()
          //     ?.includes(inputValue.toLowerCase())
          // }
        />

        
      </SettingsSection>
    </Fragment>
  );
};

export default BasicInfo;
