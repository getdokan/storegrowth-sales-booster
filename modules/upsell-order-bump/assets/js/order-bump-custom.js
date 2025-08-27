function extraProducts(product_id, variation_id , check_status, offer_price) {
    
  var $ = jQuery;
  var passData = {
     offer_product_id  : product_id,
     offer_variation_id : variation_id,
     checked           : check_status,
     bump_price   : offer_price
     
    };
    $.post(bump_save_url.ajax_url_for_front, { 
        'action'    : 'upsell_offer_product_add_to_cart', 
        'data'      : passData,
        '_ajax_nonce' : bump_save_url.ajd_nonce
     }, function (data) {
        location.reload();
    });
}
