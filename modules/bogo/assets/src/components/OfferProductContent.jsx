import { __ } from "@wordpress/i18n";

const OfferProductContent = ({ offerProduct, bogoItem }) => {
    if (!offerProduct) {
        return null;
    }

  const addCommas = (number) => {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };
  let discountedPrice = parseFloat( bogoItem?.discount_amount ? bogoItem?.discount_amount : '0' )?.toFixed( 2 );

  if (bogoItem?.offer_type === "discount") {
    const productPrice = offerProduct.price;
    const discountPercent = parseFloat(bogoItem?.discount_amount + "%") / 100;
    discountedPrice = (productPrice - productPrice * discountPercent).toFixed(
      2
    );
  }

  return (
    <div>
      <span style={{ marginBottom: 12, display: "inline-block" }}>
        {offerProduct?.name}
      </span>
      <br />
      <span style={{ marginBottom: 12, display: "inline-block" }}>
        {__("Product price: ", "storegrowth-sales-booster") + offerProduct?.currency + offerProduct?.price}
      </span>
      <br />
      <span style={{ marginBottom: 12, display: "inline-block" }}>
        {__("Discounted price: ", "storegrowth-sales-booster") +
          offerProduct?.currency +
          addCommas(discountedPrice)}
      </span>
    </div>
  );
};

export default OfferProductContent;
