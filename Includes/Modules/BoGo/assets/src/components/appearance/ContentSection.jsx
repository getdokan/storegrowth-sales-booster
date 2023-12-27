import { Fragment } from "react";
import { __ } from "@wordpress/i18n";
import { useDispatch, useSelect } from "@wordpress/data";
import { SettingsSection, TextAreaBox } from "sales-booster/src/components/settings/Panels";

const ContentSection = () => {
  const { setCreateFromData } = useDispatch("sgsb_bogo");

  const { createBogoData } = useSelect((select) => ({
    createBogoData: select("sgsb_bogo").getCreateFromData(),
  }));

  const onFieldChange = (key, value) => {
    setCreateFromData({
      ...createBogoData,
      [key]: value,
    });
  };

  return (
    <Fragment>
      <SettingsSection>
        <TextAreaBox
          areaRows={3}
          name={'bogo_shop_page_message'}
          fieldValue={createBogoData?.bogo_shop_page_message}
          changeHandler={onFieldChange}
          title={__('Shop Page Message', 'storegrowth-sales-booster')}
          placeHolderText={__('Enter the text for shop page', 'storegrowth-sales-booster')}
          tooltip={__('example text', 'storegrowth-sales-booster')}
        />
        <TextAreaBox
          areaRows={3}
          name={'bogo_product_page_message'}
          fieldValue={createBogoData?.bogo_product_page_message}
          changeHandler={onFieldChange}
          title={__('Product Page Message', 'storegrowth-sales-booster')}
          placeHolderText={__('Enter the text for shop page', 'storegrowth-sales-booster')}
          tooltip={__('example text', 'storegrowth-sales-booster')}
        />
      </SettingsSection>
    </Fragment>
  );
};

export default ContentSection;
