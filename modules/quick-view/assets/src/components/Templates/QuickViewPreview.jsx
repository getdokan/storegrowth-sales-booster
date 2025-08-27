import React from "react";
import { Button ,Image} from 'antd';
import QuickViewIcon from "../QuickViewIcon";
import ProductImage from '../../../images/dummy-product.svg'

const QuickViewPreview = ({ formData }) => {
  const buttonStyle = {
    borderRadius: formData?.button_border_radius,
    backgroundColor: formData?.button_color,
    color: formData?.button_text_color,
  };

  const buttonContent = formData.enable_qucik_view_icon && sgsbAdmin.isPro ? (
    <QuickViewIcon
      activeIcon={true}
      iconName={formData?.quick_view_icon}
      iconColor={formData?.button_text_color}
    />
  ) : (
    formData?.button_label
  );

  return (
    <>
    <div className="quick-view-wrapper"
      style={
        {
          padding: "25px",
          background: "#00000014",
          borderRadius: "6px",
        }
      }
    >
      <div
        id="product-36"
        className="product"
        style={{
          display: "flex",
          height: "200px",
          borderRadius: "6px",
          overflow: "hidden",
          position: "relative",
        }}
      >
        {formData?.show_image && (
          <div className="thumbnails">
            <div className="images">
              <div className="thumbnail" data-id="59">
                <Image width={200} src={ProductImage} preview={false}/>
                {/* <img
                  
                  src={}
                  className="attachment-sgsbqcv size-sgsbqcv"
                /> */}
              </div>
            </div>
          </div>
        )}
        <div
          className="summary entry-summary"
          style={{
            height: "100%",
            position: "relative",
            width:"100%",
            background: `${formData?.modal_background_color}`,
          }}
        >
          <div
            className="summary-content"
            style={{
              height: "inherit",
              overflowX: "hidden",
              overflowY: "auto",
              padding: "20px",
            }}
          >
            {formData?.show_title && (
              <h3 className="product_title entry-title">Beanie with Logo</h3>
            )}
            {formData?.show_excerpt && (
              <div className="woocommerce-product-details__short-description">
                <p>This is a simple product.</p>
              </div>
            )}
            {formData?.show_price && (
              <p className="price">
                <del aria-hidden="true">
                  <span className="woocommerce-Price-amount amount">
                    <bdi>
                      20.00
                      <span className="woocommerce-Price-currencySymbol">
                        ৳&nbsp;
                      </span>
                    </bdi>
                  </span>
                </del>
                <ins>
                  <span className="woocommerce-Price-amount amount">
                    <bdi>
                      18.00
                      <span className="woocommerce-Price-currencySymbol">
                        ৳&nbsp;
                      </span>
                    </bdi>
                  </span>
                </ins>
              </p>
            )}

            {formData?.show_add_to_cart && (
              <form className="cart" style={{ display: "flex", gap: "10px" }}>
                <div className="quantity">
                  <label
                    className="screen-reader-text"
                  >
                    Beanie with Logo quantity
                  </label>
                  <input style={{ width: "42px" }} type="number" value={1} />
                </div>
                <button name="add-to-cart" className="single-add-to-cart alt">
                  Add to cart
                </button>
              </form>
            )}
            {formData?.show_meta && (
              <div className="product_meta" style={{ margin: '10px 0px' }}>
                <span className="sku_wrapper">
                  SKU: <span className="sku">Woo-beanie-logo</span>
                </span>
                <span className="posted_in">
                  Category:{" "}
                  <p style={{
                    color:"blue",
                  }} rel="tag">
                    Accessories
                  </p>
                </span>
              </div>
            )}

            {formData?.show_description && (
              <div className="description-container">
                <div className="description-heading">
                  <h3 className="heading">Description</h3>
                </div>
                <div className="description-content">
                  <p>
                    Pellentesque habitant morbi tristique senectus et netus et
                    malesuada fames ac turpis egestas. Vestibulum tortor quam,
                    feugiat vitae, ultricies eget, tempor sit amet, ante. Donec eu
                    libero sit amet quam egestas semper. Aenean ultricies mi vitae
                    est. Mauris placerat eleifend leo.
                  </p>
                </div>
              </div>
            )}
          </div>
          {formData?.show_view_details_button && (
            <div
              className="quick-view close-btn"
              style={{
                position: "sticky",
                right: "0px",
                bottom: "-1px",
                background: "black",
                color: "white",
                fontSize: "11px",
                width: "100%",
                padding: "4px 0px",
                textAlign: "center",
              }}
            >
              <span className={"view-details-button"}>
                View Product Details
              </span>
            </div>)}
        </div>
        {formData?.enable_close_button && (
          <div
            className="quick-view close-btn"
            style={{
              position: "absolute",
              right: "6px",
              top: "-6px",
              fontSize: "20px",
            }}
          >
            x
          </div>
        )}
      </div>
      </div>
      <div className="quick-view-button" style={{ marginTop: "40px" }}>
        <Button style={buttonStyle}>{buttonContent}</Button>
      </div>
    </>
  );
};

export default QuickViewPreview;
