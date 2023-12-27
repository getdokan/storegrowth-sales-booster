import { __ } from "@wordpress/i18n";

const OfferProductContent = ({ offerProduct, bogoItem }) => {
  const addCommas = (number) => {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };
  const product =
    products_and_categories?.product_list?.simpleProductForOffer?.find(
      (simpleProduct) =>
        simpleProduct?.value === parseInt(bogoItem.offer_product)
    );
  let discountedPrice = parseFloat(bogoItem?.discount_amount)?.toFixed(2);

  if (bogoItem?.offer_type === "discount") {
    const currencySymbol = product?.currency;
    const productPrice = parseFloat(
      product?.price?.replace(new RegExp("[" + currencySymbol + ",]", "g"), "")
    );
    const discountPercent = parseFloat(bogoItem?.discount_amount + "%") / 100;
    discountedPrice = (productPrice - productPrice * discountPercent).toFixed(
      2
    );
  }

  return (
    <div>
      <span style={{ marginBottom: 12, display: "inline-block" }}>
        {offerProduct}
      </span>
      <br />
      <span style={{ marginBottom: 12, display: "inline-block" }}>
        {__("Product price: ", "storegrowth-sales-booster") + product?.price}
      </span>
      <br />
      <span style={{ marginBottom: 12, display: "inline-block" }}>
        {__("Discounted price: ", "storegrowth-sales-booster") +
          product?.currency +
          addCommas(discountedPrice)}
      </span>
    </div>
  );
};

export default OfferProductContent;
