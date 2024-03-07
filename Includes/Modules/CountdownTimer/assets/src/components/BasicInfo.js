import React, { Fragment } from "react";
import { __ } from "@wordpress/i18n";
import SettingsSection from "sales-booster/src/components/settings/Panels/PanelSettings/SettingsSection";
import SectionHeader from "sales-booster/src/components/settings/Panels/SectionHeader";
import TextInput from "sales-booster/src/components/settings/Panels/PanelSettings/Fields/TextInput";
import SelectBox from "sales-booster/src/components/settings/Panels/PanelSettings/Fields/SelectBox";
import DateField from "sales-booster/src/components/settings/Panels/PanelSettings/Fields/DateField";
import Switcher from "sales-booster/src/components/settings/Panels/PanelSettings/Fields/Switcher";
import OfferField from "./OfferField";

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
          title={__("Timer For", "storegrowth-sales-booster-pro")}
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
          title={__("Offer For", "storegrowth-sales-booster-pro")}
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

        <DateField
          // needUpgrade={true}
          name={"offer_start"}
          title={__("Offer End", "storegrowth-sales-booster")}
          tooltip={__("Offer End", "storegrowth-sales-booster")}
          fullWidth={false}
        />
        <DateField
          // needUpgrade={true}
          name={"offer_end"}
          title={__("Offer End", "storegrowth-sales-booster")}
          tooltip={__("Offer Endt", "storegrowth-sales-booster")}
          fullWidth={false}
        />
      </SettingsSection>
      <SectionHeader title={__("Offer Section", "storegrowth-sales-booster")} />
      <SettingsSection>
      <Switcher
        colSpan={ 24 }
        name={"enable_ct_block"}
        // changeHandler={onFieldChange}
        // isEnable={Boolean(formData.enable_ct_block)}
        title={ __( 'Overwite Woocommerce Offer', 'storegrowth-sales-booster' ) }
            tooltip={ __(
                'By Enableing this the offer defined by woocommerce will get overwite',
                'storegrowth-sales-booster'
            ) }
      />
        <OfferField />
        <SelectBox
          colSpan={24}
          showSearch={true}
          fieldWidth={"100%"}
          name={`offer_product`}
          // changeHandler={onFieldChange}
          // options={simpleProductForOffer}
          classes={`search-single-select`}
          title={__("Offer Product", "storegrowth-sales-booster")}
          tooltip={__(
            "The specific product that will be available in the order bump with an offer.",
            "storegrowth-sales-booster",
          )}
          placeHolderText={__(
            "Search for offer product",
            "storegrowth-sales-booster",
          )}
          // fieldValue={
          //   offerProductId
          //     ? filterByValue(simpleProductForOffer, offerProductId)
          //     : null
          // }
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
