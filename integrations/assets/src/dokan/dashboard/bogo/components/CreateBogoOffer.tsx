import { useState, useEffect, useCallback } from "@wordpress/element";
import { useSelect } from "@wordpress/data";
import { __ } from "@wordpress/i18n";
// @ts-ignore
import apiFetch from "@wordpress/api-fetch";
// @ts-ignore
import { dateI18n, getSettings } from "@wordpress/date";
import {
  SimpleInput,
  SimpleRadio,
  TextArea,
  SearchableSelect,
  useToast,
  DokanToaster,
} from "@getdokan/dokan-ui";
// @ts-ignore
import { DokanButton, WpDatePicker } from "@dokan/components";
import ProductSearch from "./ProductSearch";

const CreateBogoOffer = ({ navigate, params }) => {
  const toast = useToast();
  const id = params?.id || 0;
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSchedules, setSelectedSchedules] = useState([
    { label: __("Daily", "storegrowth-sales-booster"), value: "daily" },
  ]);
  const [vendorId, setVendorId] = useState(0);
  const [errorCode, setErrorCode] = useState(0);
  const [targetProduct, setTargetProduct] = useState(null);
  const [offerProduct, setOfferProduct] = useState(null);

  const currentUser = useSelect((select) => {
    return select("dokan/core").getCurrentUser();
  }, []);

  const [formData, setFormData] = useState({
    id: id,
    offer_name: "",
    target_product: null,
    deal_type: "different", // 'different' or 'same'
    offer_product: 0,
    offer_type: "free", // 'free' or 'discount'
    discount_amount: 0,
    min_qty: 1,
    offer_schedule: "daily", // daily, saturday, sunday, monday, tuesday, wednesday, thursday, friday
    schedule_start: "",
    schedule_end: "",
    shop_page_msg: "",
    product_page_msg: __("Free Gift", "storegrowth-sales-booster"),
  });

  const dealTypes = [
    {
      label: __("Buy X Get Y", "storegrowth-sales-booster"),
      value: "different",
    },
    {
      label: __("Buy X Get X", "storegrowth-sales-booster"),
      value: "same",
    },
  ] as any;

  const filteredDealTypes = dealTypes.filter((item) => item.value !== "same");

  const offerTypes = [
    {
      value: "free",
      label: __("Free", "storegrowth-sales-booster"),
    },
    {
      value: "discount",
      label: __("Discount (%)", "storegrowth-sales-booster"),
    },
  ] as any;

  const offerSchedules = [
    {
      value: "daily",
      label: __("Daily", "storegrowth-sales-booster"),
    },
    {
      value: "saturday",
      label: __("Saturday", "storegrowth-sales-booster"),
    },
    {
      value: "sunday",
      label: __("Sunday", "storegrowth-sales-booster"),
    },
    {
      value: "monday",
      label: __("Monday", "storegrowth-sales-booster"),
    },
    {
      value: "tuesday",
      label: __("Tuesday", "storegrowth-sales-booster"),
    },
    {
      value: "wednesday",
      label: __("Wednesday", "storegrowth-sales-booster"),
    },
    {
      value: "thursday",
      label: __("Thursday", "storegrowth-sales-booster"),
    },
    {
      value: "friday",
      label: __("Friday", "storegrowth-sales-booster"),
    },
  ] as any;

  // @ts-ignore
  const adminSettings = sgsbBogoDokanVendorDashboard;

  const requiredFields = ["offer_name", "target_product", "deal_type"];

  const fetchBogoOffer = useCallback(async () => {
    if (!id) {
      return;
    }
    try {
      setIsLoading(true);
      setErrorCode(0);
      const response = await apiFetch<any>({
        path: `sales-booster/v1/bogo/vendor-offers/${id}`,
        method: "GET",
      });
      if (response.id) {
        setFormData({
          ...response,
          offer_name: response.name_of_order_bogo || "",
          target_product: response.offered_products || null,
          deal_type: response.bogo_deal_type || "different", // 'different' or 'same'
          offer_product: response.get_different_product_field || 0,
          offer_type: response.offer_type || "free", // 'free' or 'discount'
          discount_amount: response.discount_amount || "",
          min_qty: response.minimum_quantity_required || 1,
          offer_schedule: response.offer_schedule || "daily", // daily, saturday, sunday, monday, tuesday, wednesday, thursday, friday
          schedule_start: response.offer_start || "",
          schedule_end: response.offer_end || "",
          shop_page_msg: response.shop_page_message || "",
          product_page_msg:
            response.product_page_message ||
            __("Free Gift", "storegrowth-sales-booster"),
        });

        setSelectedSchedules(
          offerSchedules.filter((item) =>
            response.offer_schedule.includes(item?.value)
          )
        );

        const responseTargetProduct = await apiFetch<any>({
          path: `dokan/v2/products/${response.offered_products}`,
          method: "GET",
        });

        if (responseTargetProduct.id) {
          setTargetProduct({
            label: `#${responseTargetProduct.id} ${responseTargetProduct.name}`,
            value: responseTargetProduct.id,
          });
        }

        if (response.get_different_product_field) {
          const responseOfferProduct = await apiFetch<any>({
            path: `dokan/v2/products/${response.get_different_product_field}`,
            method: "GET",
          });

          if (responseOfferProduct.id) {
            setOfferProduct({
              label: `#${responseOfferProduct.id} ${responseOfferProduct.name}`,
              value: responseOfferProduct.id,
            });
          }
        }
      }
    } catch (offerError) {
      setErrorCode(offerError?.data?.status || offerError?.code);
      throw offerError;
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  // Handle form data change.
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if ("deal_type" === name) {
      setFormData((prev) => ({
        ...prev,
        offer_product: 0,
      }));
    }
  };

  const handleSelectInputChange = (selectedKey, selectedOption) => {
    if ("target_product" === selectedKey) {
      setTargetProduct({
        label: selectedOption?.label,
        value: selectedOption?.value,
      });
    }

    if ("offer_product" === selectedKey) {
      setOfferProduct({
        label: selectedOption?.label,
        value: selectedOption?.value,
      });
    }

    setFormData((prev) => ({
      ...prev,
      [selectedKey]: selectedOption?.value,
    }));
  };

  const resetFormData = () => {
    setFormData({
      id: 0,
      offer_name: "",
      target_product: null, // null or { label, value }
      deal_type: "different", // 'different' or 'same'
      offer_product: null, // null or { label, value }
      offer_type: "free", // 'free' or 'discount'
      discount_amount: "",
      min_qty: 1,
      offer_schedule: "daily", // daily, saturday, sunday, monday, tuesday, wednesday, thursday, friday
      schedule_start: "",
      schedule_end: "",
      shop_page_msg: "",
      product_page_msg: __("Free Gift", "storegrowth-sales-booster"),
    });
  };

  const createOffer = async (formData) => {
    return await apiFetch({
      path: `sales-booster/v1/bogo/offers/vendor/${vendorId}`,
      method: "POST",
      data: formData,
    });
  };
  const updateOffer = async (formData) => {
    return await apiFetch({
      path: `sales-booster/v1/bogo/vendor-offers/${formData.id}`,
      method: "POST",
      data: formData,
    });
  };
  const mapPayload = (data) => {
    return {
      ...data,
      name_of_order_bogo: data?.offer_name,
      offered_products: data?.target_product,
      bogo_deal_type: data?.deal_type,
      get_different_product_field: data?.offer_product,
      minimum_quantity_required: data?.min_qty,
      offer_schedule: data?.offer_schedule.split(","),
      offer_start: data?.schedule_start,
      offer_end: data?.schedule_end,
      shop_page_message: data?.shop_page_msg,
      product_page_message: data?.product_page_msg,
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form data.
    const hasEmptyRequiredField = requiredFields.some(
      (field) => !formData[field]
    );

    if (hasEmptyRequiredField) {
      toast({
        type: "error",
        title: __(
          "Please fill all of the required fields.",
          "storegrowth-sales-booster"
        ),
      });
      return;
    }

    if (
      "different" === formData.deal_type &&
      formData.target_product === formData.offer_product
    ) {
      toast({
        type: "error",
        title: __(
          "Please choose different offer product.",
          "storegrowth-sales-booster"
        ),
      });
      return;
    }

    try {
      setIsLoading(true);
      const payload = mapPayload(formData);

      if (formData.id) {
        await updateOffer(payload);

        toast({
          type: "success",
          title: __("Offer updated successfully.", "storegrowth-sales-booster"),
        });
      } else {
        await createOffer(payload);
        navigate("/sales-booster/bogo/");
        toast({
          type: "success",
          title: __("Offer created successfully.", "storegrowth-sales-booster"),
        });
      }
    } catch (error) {
      toast({
        type: "error",
        title:
          error?.message ||
          __("Failed to submitting the form.", "storegrowth-sales-booster"),
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!currentUser || !currentUser?.id) {
      return;
    }

    setVendorId(currentUser?.id);
  }, [currentUser]);

  useEffect(() => {
    fetchBogoOffer().catch(resetFormData);
  }, [id, fetchBogoOffer]);

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      offer_schedule: selectedSchedules
        .map((schedule) => schedule.value)
        .join(","),
    }));
  }, [selectedSchedules]);

  return (
    <div className="py-4">
      <form className="space-y-2 flex flex-col" onSubmit={handleSubmit}>
        <div className="mb-2.5">
          <SimpleInput
            label={__("Name of BOGO Offer", "storegrowth-sales-booster")}
            input={{
              id: "offer_name",
              name: "offer_name",
              type: "text",
              placeholder: __("Offer Name", "storegrowth-sales-booster"),
            }}
            value={formData.offer_name}
            onChange={handleChange}
            disabled={isLoading}
            required
          />
        </div>

        <div className="pb-4">
          <ProductSearch
            name="target_product"
            label={__("Target Product", "storegrowth-sales-booster")}
            isMulti={false}
            placeholder={__("Search for a target product", "dokan")}
            onChange={(option) =>
              handleSelectInputChange("target_product", option)
            }
            disabled={isLoading}
            required={true}
            value={targetProduct}
          />
        </div>

        <div className="mb-5">
          <SimpleRadio
            optionClass="!inline-block mr-4"
            label={__("Deal Type", "storegrowth-sales-booster")}
            name="deal_type"
            options={
              adminSettings?.vendors_can_create_buy_x_get_x
                ? dealTypes
                : filteredDealTypes
            }
            value={formData.deal_type}
            onChange={handleChange}
            defaultValue="different"
            required
          />
        </div>

        {"different" === formData.deal_type && (
          <div className="pb-4">
            <ProductSearch
              name="offer_product"
              label={__("Offer Product", "storegrowth-sales-booster")}
              isMulti={false}
              placeholder={__("Search for a offer product", "dokan")}
              onChange={(option) =>
                handleSelectInputChange("offer_product", option)
              }
              disabled={isLoading}
              required={true}
              value={offerProduct}
            />
          </div>
        )}

        <div className="pb-4 flex">
          <div className="min-w-[8rem]">
            <SearchableSelect
              label={__("Offer Type", "storegrowth-sales-booster")}
              options={offerTypes}
              onChange={(option) =>
                handleSelectInputChange("offer_type", option)
              }
              value={offerTypes.find(
                (option) => option.value === formData.offer_type
              )}
              required
            />
          </div>

          {"discount" === formData.offer_type && (
            <div className="mb-4 mt-8 ml-4 min-w-[8rem]">
              <SimpleInput
                input={{
                  id: "discount_amount",
                  name: "discount_amount",
                  type: "number",
                  min: "1",
                  max: "100",
                  disabled: isLoading,
                }}
                value={formData.discount_amount}
                onChange={handleChange}
                required
              />
            </div>
          )}
        </div>

        {adminSettings?.is_pro_active && (
          <div className="pb-4">
            <SimpleInput
              label={__("Select Min Quantity", "storegrowth-sales-booster")}
              input={{
                id: "min_qty",
                name: "min_qty",
                type: "number",
                min: "1",
                max: "9999",
                disabled: isLoading,
              }}
              value={formData.min_qty}
              onChange={handleChange}
              required
            />
          </div>
        )}

        {adminSettings?.vendors_can_set_shop_page_custom_message && (
          <>
           
              <div className="pb-4">
                <SearchableSelect
                  label={__("Offer Schedule", "storegrowth-sales-booster")}
                  isMulti={true}
                  isSearchable={true}
                  placeholder={__("Select Schedule Days", "dokan")}
                  value={selectedSchedules}
                  options={offerSchedules}
                  onChange={(selected) => setSelectedSchedules([...selected])}
                  required
                />
              </div>
              <div className="pb-4">
                <label htmlFor="schedule_start">
                  {__("Filter by Date", "storegrowth-sales-booster")}
                </label>
                <WpDatePicker
                  onChange={(date) => {
                    setFormData((prev) => ({
                      ...prev,
                      schedule_start: date ? date.split("T")[0] : date,
                    }));
                  }}
                  currentDate={
                    formData.schedule_start
                      ? new Date(formData.schedule_start)
                      : new Date()
                  }
                >
                  <SimpleInput
                    input={{
                      id: "schedule_start",
                      name: "schedule_start",
                      type: "text",
                      placeholder: __(
                        "Select Start Date",
                        "storegrowth-sales-booster"
                      ),
                    }}
                    value={
                      formData.schedule_start
                        ? dateI18n(
                            getSettings().formats.date,
                            new Date(formData.schedule_start),
                            getSettings().timezone.string
                          )
                        : ""
                    }
                    onChange={() => {}}
                    disabled={isLoading}
                  />
                </WpDatePicker>
              </div>
              <div className="pb-4">
                <label htmlFor="schedule_end">
                  {__("Filter by Date", "storegrowth-sales-booster")}
                </label>
                <WpDatePicker
                  onChange={(date) => {
                    setFormData((prev) => ({
                      ...prev,
                      schedule_end: date ? date.split("T")[0] : date,
                    }));
                  }}
                  currentDate={
                    formData.schedule_end
                      ? new Date(formData.schedule_end)
                      : new Date()
                  }
                >
                  <SimpleInput
                    input={{
                      id: "schedule_end",
                      name: "schedule_end",
                      type: "text",
                      placeholder: __(
                        "Select Start Date",
                        "storegrowth-sales-booster"
                      ),
                    }}
                    value={
                      formData.schedule_end
                        ? dateI18n(
                            getSettings().formats.date,
                            new Date(formData.schedule_end),
                            getSettings().timezone.string
                          )
                        : ""
                    }
                    onChange={() => {}}
                    disabled={isLoading}
                  />
                </WpDatePicker>
              </div>
          </>
        )}

        {adminSettings?.vendors_can_set_shop_page_custom_message && (
          <div className="pb-4">
            <TextArea
              input={{
                id: "shop_page_msg",
                name: "shop_page_msg",
                placeholder: __(
                  "Buy This Product and Get Another Product Free",
                  "dokan"
                ),
                rows: 3,
              }}
              label={__("Shop Page Message", "storegrowth-sales-booster")}
              value={formData.shop_page_msg}
              onChange={handleChange}
              className="w-full h-fit focus:!ring-0"
            />
          </div>
        )}

        {adminSettings?.vendors_can_set_product_page_custom_message && (
          <div className="pb-4">
            <TextArea
              input={{
                id: "product_page_msg",
                name: "product_page_msg",
                placeholder: __("Free Gift", "dokan"),
                rows: 3,
              }}
              label={__("Product Page Message", "storegrowth-sales-booster")}
              value={formData.product_page_msg}
              onChange={handleChange}
              className="w-full h-fit focus:!ring-0"
            />
          </div>
        )}

        <div className="pt-4 flex gap-4 justify-end">
          <DokanButton
            onClick={() => {
              navigate("/sales-booster/bogo/");
              window.scrollTo({
                top: 0,
                left: 0,
                behavior: "smooth", // Add smooth scrolling animation
              });
            }}
            variant="secondary"
          >
            {__("Cancel", "storegrowth-sales-booster")}
          </DokanButton>
          <DokanButton type="submit" loading={isLoading} disabled={isLoading}>
            {formData.id
              ? __("Update Offer", "storegrowth-sales-booster")
              : __("Create Offer", "storegrowth-sales-booster")}
          </DokanButton>
        </div>
      </form>

      <DokanToaster />
    </div>
  );
};

export default CreateBogoOffer;
