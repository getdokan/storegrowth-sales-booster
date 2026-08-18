import { useEffect, useState } from "@wordpress/element";
import apiFetch from "@wordpress/api-fetch";
import { __ } from "@wordpress/i18n";
import { Col, Select, Typography } from "antd";

import SettingsTooltip from "../SettingsTooltip";
import UpgradeCrown from "../UpgradeCrown";
import FieldWrapper from "./FieldWrapper";

const { Title } = Typography;

const debounce = (fn, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
};

/**
 * Multi-select of products backed by the REST products search, so the whole
 * catalogue is never preloaded into the page.
 *
 * Options are the union of what the shopper searches for and the labels of the
 * already-selected ids (resolved once on mount), so saved selections keep their
 * names. External products are excluded, matching the previous behaviour.
 */
const ProductAsyncMultiSelect = ({
  name,
  title,
  tooltip,
  fieldValue,
  changeHandler,
  placeHolderText,
  colSpan = 24,
  needUpgrade = false,
}) => {
  const [options, setOptions] = useState([]);
  const [fetching, setFetching] = useState(false);

  const toOptions = (list) =>
    (list || [])
      .filter((product) => product?.type !== "external")
      .map((product) => ({ label: product.name, value: product.id }));

  const mergeOptions = (incoming) => {
    setOptions((previous) => {
      const byValue = new Map(previous.map((option) => [option.value, option]));
      incoming.forEach((option) => byValue.set(option.value, option));
      return Array.from(byValue.values());
    });
  };

  // Resolve labels for the already-selected products so their chips render.
  useEffect(() => {
    const ids = (fieldValue || []).map(Number).filter(Boolean);

    if (!ids.length) {
      return;
    }

    apiFetch({
      path: `/sales-booster/v1/products?include=${ids.join(",")}&per_page=${ids.length}`,
    })
      .then((response) => mergeOptions(toOptions(response)))
      .catch(() => {});
  }, []);

  const searchProducts = debounce((value = "") => {
    setFetching(true);

    const params = new URLSearchParams({ search: value, per_page: 30 });

    apiFetch({ path: `/sales-booster/v1/products?${params.toString()}` })
      .then((response) => mergeOptions(toOptions(response)))
      .catch(() => {})
      .finally(() => setFetching(false));
  }, 500);

  return (
    <FieldWrapper colSpan={colSpan} upgradeClass={needUpgrade ? "upgrade-settings" : ""}>
      <Col span={9}>
        <div className="card-heading">
          <Title level={3} className="settings-heading space-top">
            {title}
          </Title>
          {tooltip && <SettingsTooltip content={tooltip} />}
          {needUpgrade && <UpgradeCrown />}
        </div>
      </Col>
      <Col span={15}>
        <Select
          allowClear
          showSearch
          mode="multiple"
          value={fieldValue}
          options={options}
          filterOption={false}
          loading={fetching}
          style={{ width: "100%" }}
          placeholder={placeHolderText}
          className="settings-field select-field"
          onSearch={searchProducts}
          onFocus={() => {
            if (!options.length) {
              searchProducts();
            }
          }}
          onChange={(value) => changeHandler(name, value)}
          notFoundContent={
            fetching
              ? __("Searching…", "storegrowth-sales-booster")
              : __("Type to search products", "storegrowth-sales-booster")
          }
        />
      </Col>
    </FieldWrapper>
  );
};

export default ProductAsyncMultiSelect;
