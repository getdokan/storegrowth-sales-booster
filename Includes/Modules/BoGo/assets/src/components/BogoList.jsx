import { __ } from "@wordpress/i18n";
import { applyFilters } from "@wordpress/hooks";
import { Table, Button, notification } from "antd";
import { useDispatch, useSelect } from "@wordpress/data";
import { Switch } from 'antd';
import { useEffect, useState } from "@wordpress/element";
import { convertBogoItemHtmlEntitiesToTexts } from "../helper";
import { Fragment } from "react";
import { nanoid } from 'nanoid';
import UpgradeCard from "sales-booster/src/components/settings/Panels/PanelSettings/UpgradeCard";
import OfferProductContent from "./OfferProductContent";

const deleteBogo = (stateUpdateCallback) => (id) => {
  stateUpdateCallback(true);
  jQuery.post(
    bogo_save_url.ajax_url,
    {
      action: "bogo_delete",
      data: id,
      _ajax_nonce: bogo_save_url.ajd_nonce,
    },
    function () {
      notification["error"]({
        message: "Bogo deleted",
      });
      stateUpdateCallback(false);
      location.reload();
    }
  );
};

const statusHandler = (id, status, stateUpdateCallback) => {
  jQuery.post(
    bogo_save_url.ajax_url,
    {
      action: "bogo_status_handler",
      data: { id, status },
      _ajax_nonce: bogo_save_url.ajd_nonce,
    },
    function (response) {
      notification["success"]({
        message: __("Status Updated", 'storegrowth-sales-booster'),
      });
      stateUpdateCallback(response.data);
    }
  );
};


function ActionToggler({ bogo_id, bogo_status }) {
  const [isChecked, setIsChecked] = useState(bogo_status === "yes");

  const handleSwitchChange = (checked) => statusHandler(bogo_id, checked, setIsChecked);

  return (
    <Fragment>
      <Switch size="small"
        defaultChecked={isChecked}
        onChange={handleSwitchChange} />
      <div className={`table-categories`} style={{ marginTop: 8 }}>
        <span style={{ padding: 0 }} className={`category-pills`}>
          {__(isChecked ? "Active" : "Deactive", "storegrowth-sales-booster")}
        </span>
      </div>
    </Fragment>)
}

function ActionButton({ navigate, bogo_id }) {
  const [buttonLoading, setButtonLoading] = useState(false);

  return (
    <Fragment>
      <Button
        shape="round"
        size="small"
        style={{
          gap: 8,
          border: 0,
          padding: 0,
          marginRight: 20,
          boxShadow: "none",
          alignItems: "center",
          display: "inline-flex",
          background: "transparent",
        }}
        onClick={() => navigate("/bogo/" + bogo_id)}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M2.77533 10.8994C2.64733 10.8994 2.51958 10.8506 2.42183 10.7529C2.22658 10.5576 2.22658 10.2411 2.42183 10.0459L10.2353 2.23237C10.4303 2.03712 10.7471 2.03712 10.9423 2.23237C11.1376 2.42763 11.1376 2.74413 10.9423 2.93938L3.12883 10.7529C3.03133 10.8504 2.90333 10.8994 2.77533 10.8994Z"
            fill="#02AC6E"
          />
          <path
            d="M2.00441 14.4993C1.96966 14.4993 1.93441 14.4955 1.89916 14.488C1.62916 14.43 1.45716 14.1643 1.51516 13.8943L2.28766 10.2935C2.34566 10.0235 2.61266 9.85204 2.88141 9.90954C3.15141 9.96754 3.32341 10.2333 3.26541 10.5033L2.49291 14.104C2.44266 14.3388 2.23516 14.4993 2.00441 14.4993Z"
            fill="#02AC6E"
          />
          <path
            d="M5.60541 13.7273C5.47741 13.7273 5.34966 13.6785 5.25191 13.5808C5.05666 13.3855 5.05666 13.069 5.25191 12.8737L13.0654 5.0605C13.2604 4.86525 13.5772 4.86525 13.7724 5.0605C13.9677 5.25575 13.9677 5.57225 13.7724 5.7675L5.95916 13.5808C5.86141 13.6785 5.73341 13.7273 5.60541 13.7273Z"
            fill="#02AC6E"
          />
          <path
            d="M2.00358 14.4991C1.77283 14.4991 1.56558 14.3386 1.51508 14.1038C1.45733 13.8338 1.62908 13.5681 1.89908 13.5101L5.49983 12.7376C5.77008 12.6803 6.03583 12.8518 6.09358 13.1216C6.15133 13.3916 5.97958 13.6573 5.70958 13.7153L2.10883 14.4878C2.07358 14.4956 2.03833 14.4991 2.00358 14.4991Z"
            fill="#02AC6E"
          />
          <path
            d="M12.004 7.32819C11.876 7.32819 11.748 7.27944 11.6505 7.18169L8.82222 4.35344C8.62697 4.15819 8.62697 3.84169 8.82222 3.64644C9.01722 3.45119 9.33422 3.45119 9.52922 3.64644L12.3575 6.47469C12.5527 6.66994 12.5527 6.98644 12.3575 7.18169C12.26 7.27944 12.132 7.32819 12.004 7.32819Z"
            fill="#02AC6E"
          />
          <path
            d="M13.4185 5.91431C13.2905 5.91431 13.1625 5.86556 13.0648 5.76781C12.8695 5.57256 12.8695 5.25606 13.0648 5.06056C13.343 4.78231 13.4963 4.40556 13.4963 4.00006C13.4963 3.59456 13.343 3.21781 13.0648 2.93956C12.7863 2.66106 12.4095 2.50781 12.004 2.50781C11.5985 2.50781 11.2218 2.66106 10.9435 2.93956C10.7485 3.13481 10.432 3.13506 10.2363 2.93956C10.041 2.74431 10.041 2.42781 10.2363 2.23231C10.7033 1.76506 11.331 1.50781 12.004 1.50781C12.6768 1.50781 13.3048 1.76506 13.7718 2.23231C14.239 2.69931 14.4963 3.32706 14.4963 4.00006C14.4963 4.67306 14.239 5.30081 13.7718 5.76781C13.6745 5.86531 13.5465 5.91431 13.4185 5.91431Z"
            fill="#02AC6E"
          />
        </svg>
        {__("Edit", "storegrowth-sales-booster")}
      </Button>
      <Button
        shape="round"
        size="small"
        style={{
          gap: 8,
          border: 0,
          padding: 0,
          boxShadow: "none",
          alignItems: "center",
          display: "inline-flex",
          background: "transparent",
        }}
        onClick={() => deleteBogo(setButtonLoading)(bogo_id)}
        loading={buttonLoading}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M14.6654 2.66667H11.332V1.33333C11.332 0.979711 11.1916 0.640573 10.9415 0.390524C10.6915 0.140476 10.3523 0 9.9987 0L5.9987 0C5.64508 0 5.30594 0.140476 5.05589 0.390524C4.80584 0.640573 4.66536 0.979711 4.66536 1.33333V2.66667H1.33203V4H2.66536V14C2.66536 14.5304 2.87608 15.0391 3.25115 15.4142C3.62622 15.7893 4.13493 16 4.66536 16H11.332C11.8625 16 12.3712 15.7893 12.7462 15.4142C13.1213 15.0391 13.332 14.5304 13.332 14V4H14.6654V2.66667ZM5.9987 1.33333H9.9987V2.66667H5.9987V1.33333ZM11.9987 14C11.9987 14.1768 11.9285 14.3464 11.8034 14.4714C11.6784 14.5964 11.5088 14.6667 11.332 14.6667H4.66536C4.48855 14.6667 4.31898 14.5964 4.19396 14.4714C4.06894 14.3464 3.9987 14.1768 3.9987 14V4H11.9987V14Z"
            fill="#DC1B1B"
          />
          <path
            d="M7.33333 6.66797H6V12.0013H7.33333V6.66797Z"
            fill="#DC1B1B"
          />
          <path
            d="M9.9974 6.66797H8.66406V12.0013H9.9974V6.66797Z"
            fill="#DC1B1B"
          />
        </svg>
        {__("Delete", "storegrowth-sales-booster")}
      </Button>
    </Fragment>
  );
}

function TargetProductAndCategory({ catList, productList }) {

  return (
    <>
      {productList && (
        <div style={{ marginBottom: 12 }}>
          {__("Target Products", "storegrowth-sales-booster")} <br />
          <div className={`table-products`} style={{ marginTop: 8 }}>
            {productList?.split(",")?.map((product) => (
              <span key={nanoid()} className={`product-pills`}>{product}</span>
            ))}
          </div>
        </div>
      )}

      {catList && (
        <div>
          {__("Target Categories", "storegrowth-sales-booster")} <br />
          <div className={`table-categories`} style={{ marginTop: 8 }}>
            {catList?.split(",")?.map((category) => (
              <span key={nanoid()} className={`category-pills`}>{category}</span>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

function BogoList({ navigate }) {
  const { setPageLoading } = useDispatch("sgsb");
  const { setBogoData } = useDispatch("sgsb_bogo");

  const { bogoListData } = useSelect((select) => ({
    bogoListData: select("sgsb_bogo").getBogoData(),
  }));
  useEffect(() => {
    setPageLoading(true);

    jQuery.post(
      bogo_save_url.ajax_url,
      {
        action: "bogo_list",
        data: [],
        _ajax_nonce: bogo_save_url.ajd_nonce,
      },
      function (bogoDataFromAjax) {
        setPageLoading(false);

        const bogoDataParsed = bogoDataFromAjax.data.map((bogoItem) =>
          convertBogoItemHtmlEntitiesToTexts(bogoItem)
        );
        setBogoData(bogoDataParsed);
      }
    );
  }, []);
  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      align: "left",
    },
    {
      title: "Status",
      dataIndex: "status",
    },
    {
      title: "Target Product(s) and Categories",
      dataIndex: "product_category",
    },
    {
      title: "Offers",
      dataIndex: "offers",
    },
    {
      title: "Action",
      dataIndex: "action",
    },
  ];

  let catInfoByCatId = bogo_products_and_categories.category_list.catNameById;
  let productInfoById = bogo_products_and_categories.product_list.productTitleById;

  function mapBogoData(item) {
    let categories = item.offered_categories;
    let catList = "";

    for (const key in categories) {
      if (Object.keys(categories).length - 1 > key) {
        catList = catList + catInfoByCatId[categories[key]] + ", ";
      } else {
        catList = catList + catInfoByCatId[categories[key]];
      }
    }

    let products = [item.offered_products];
    let productList = "";

    for (const key in products) {
      if (Object.keys(products).length - 1 > key) {
        productList = productList + productInfoById[products[key]] + ", ";
      } else {
        productList = productList + productInfoById[products[key]];
      }
    }

    let offerProduct = item.bogo_deal_type === 'same' ? productInfoById[item.offered_products] : productInfoById[item.get_different_product_field];
    return {
      key: item.id,
      name: item.name_of_order_bogo,
      status: <ActionToggler bogo_id={item.id} bogo_status={item.bogo_status} item={item} />,
      product_category: (
        <TargetProductAndCategory catList={catList} productList={productList} />
      ),
      offers: (
        <OfferProductContent offerProduct={offerProduct} bogoItem={item} />
      ),
      action: <ActionButton navigate={navigate} bogo_id={item.id} />,
    };
  }

  let data = applyFilters(
    "sgsb_upsell_order_bogo_data",
    bogoListData.slice(-2).map(mapBogoData),
    bogoListData,
    mapBogoData
  );

  const isDisableBogoCreation = applyFilters(
    "sgsb_control_upsell_order_bogo_data",
    bogoListData?.length >= 2
  );

  return (
    <div className={`upsell-order-list-table`}>
      {isDisableBogoCreation && (
        <UpgradeCard
          message={__(
            "Upgrade to premium to create more than two order bogos.",
            "storegrowth-sales-booster"
          )}
        />
      )}
      <Table
        bordered
        dataSource={data}
        columns={columns}
        className={`space-top`}
      />
    </div>
  );
}

export default BogoList;
