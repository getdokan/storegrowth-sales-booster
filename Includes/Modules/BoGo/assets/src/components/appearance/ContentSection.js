import { Input } from "antd";
import { Fragment } from "react";
import { __ } from "@wordpress/i18n";
import { useDispatch, useSelect } from "@wordpress/data";

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
      {createBogoData?.offer_type === "price" ? (
        <Fragment>
          {/* Render fixed bump offer box settings. */}
          <label htmlFor={`fixed-bump`} className={`content-bump-label`}>
            {__("For Fixed Price", "storegrowth-sales-booster")}
          </label>
          <Input
            id={`fixed-bump`}
            value={createBogoData.offer_fixed_price_title}
            onChange={(v) =>
              onFieldChange("offer_fixed_price_title", v.target.value)
            }
            placeholder={__(
              "Add fixed price title please",
              "storegrowth-sales-booster"
            )}
          />
        </Fragment>
      ) : (
        <Fragment>
          {/* Render discount bump offer box settings. */}
          <label className={`content-bump-label`} htmlFor={`discount-bump`}>
            {__("For Discount %", "storegrowth-sales-booster")}
          </label>
          <Input
            id={`discount-bump`}
            value={createBogoData.offer_discount_title}
            onChange={(v) =>
              onFieldChange("offer_discount_title", v.target.value)
            }
            placeholder={__(
              "Add discount title please",
              "storegrowth-sales-booster"
            )}
          />
        </Fragment>
      )}
    </Fragment>
  );
};

export default ContentSection;
